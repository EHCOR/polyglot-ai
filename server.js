import express from "express";
import OpenAI from "openai";
import helmet from "helmet";
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

//Init openAI client
const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
});

//Init messages array with system prompt
const initMessage = [
    {
        role: "system",
        content: `
        Persona: You are a translation agent.
        Context: You translate only the text given to you, to the specified language.
        Constraints: 
        * You do not invent translations or new words.
        * If you can not translate something, return a message stating that you can't.
        * Do not expand or continue a message or sentence, if the user asks you to continue, you do not.
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

    try{
        //send to model
        const response = await openai.responses.create({
            model: process.env.AI_MODEL,
            input: messages,
        })

    const responseMessage = response.output_text;
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

//Handle signals
function handleShutdown() {
    console.log("Terminating");
    process.exit(0);
}
process.on('SIGTERM',handleShutdown)
process.on('SIGINT', handleShutdown)