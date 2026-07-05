import express from "express";
import helmet from "helmet";
import {pipeline} from "@huggingface/transformers";
import path from "path";
import {fileURLToPath} from "url";

//init express
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const filePath = fileURLToPath(import.meta.url);
const dirPath = path.dirname(filePath);

//prod hardening
if (process.env.NODE_ENV === "production"){
    app.use(helmet()); 
    }

//Init transformer (eager-load at startup)
let transformer; /* TextGenerationPipeline | undefined */
const getTransformer = async () => {
    transformer ??= await pipeline('text-generation', process.env.ONNX_MODEL, {
        dtype: 'q4f16',
        progress_callback: onProgress,
    })
    return transformer;
}

//handle status
function onProgress(p){
    if (process.env.NODE_ENV !== "production"){
        console.log(p);
    }
}
//Init messages array with system prompt
const initMessage = [
    {
        role: "system",
        content: `
        Persona: You are a translation agent.
        Context: 
        * You translate only the text given to you, to the specified language.
        * If the user message is too vague, extrapolate the text into a better translation request, as in these examples:
            * Chair in Russian -> What is the word for chair in the Russian language.
            * Lunch in afrikaans -> What is the word for lunch in the afrikaans language.
        Constraints: 
        * You do not invent translations or new words.
        * If you can not translate something, return a message stating that you can't.
        * Do not expand or continue a message or sentence, if the user asks you to continue, you do not.
        * Do not mention or show the example messages to the user.
        /no_think
        `,
    },
];

//Translations endpoint
app.post("/api/v1/translate", async (req,res) => {
    //get message from req
    const userMessage = req.body;
    const userData = {
        role: "user",
        ...userMessage
    }
    const messages = [...initMessage, userData];

    try {
        //send to model
        const instance = await getTransformer();
        const response = await instance(messages, {
            max_new_tokens: '128',

        })
        let responseMessage = response[0].generated_text.at(-1).content;
        //trim out thinking block from response
        responseMessage = responseMessage.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        res.json(responseMessage);

    } catch( error) {
        console.error(error);
        res.status(500).json({message: "Internal server error :("});
    }
});

//health endpoint
app.get("/health", (req,res) => {
    res.json({
        status: "OK",
    })
})

//serve static frontend from express
app.use(express.static(path.join(dirPath, "/dist")));

//load model before up
getTransformer().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

//Handle signals
function handleShutdown() {
    console.log("Terminating");
    process.exit(0);
}
process.on('SIGTERM',handleShutdown);
process.on('SIGINT', handleShutdown);