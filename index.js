//front
import {marked} from "marked";
import DOMPurify from "dompurify";

//get UI elems
const submitBtn = document.getElementById("user-submit-btn");
const userInputText = document.getElementById("user-input-text");
const responseContent = document.getElementById("response-content");
const responseArea = document.getElementById("response-area");

//states
let loading = false;

function start() {
    submitBtn.addEventListener("click", handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    //clear area
    responseContent.innerHTML = "";

    //get and confirm valid user prompt
    const userPrompt = userInputText.value.trim();

    if (!userPrompt) {
        return;
    }
   
    //send prompt to backend
    setLoading(true);
    responseArea.classList.remove("hidden");

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
        responseContent.innerHTML = DOMPurify.sanitize(marked.parse(data,{async: false}));

    } catch (error) {
        responseContent.innerHTML = "<p>An Error has occurred!</p>"
        console.log(error);
    }
    finally{
        setLoading(false);
    }
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Translating…" : "Submit";
}

start();