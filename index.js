//front
import { marked } from "marked";
import DOMPurify from "dompurify";

//get UI elems
const submitBtn = document.getElementById("user-submit-btn");
const userInputText = document.getElementById("user-input-text");
const outputText = document.getElementById("output-content-area");

//states
let loading = false;

function start() {
    submitBtn.addEventListener("click", handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    //get and confirm valid user prompt
    const userPrompt = userInputText.value.trim();

    if (!userPrompt) {
        return;
    }
   
    //send prompt to backend
    loading = true;
   
    const payload = {
        content: userPrompt,
    }

    try{
        const response = await fetch("/api/v1/translate",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        })
        const data = await response.json();

        if (!response.ok){
            throw new Error(data.message);
        }
        
        outputText.value = data;

    } catch (error) {
        outputText.value = "An Error has occurred!"
        console.log(error);
    }
    finally{
        loading = false;
    }

}


start();