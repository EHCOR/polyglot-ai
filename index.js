//front
import {marked} from "marked";
import DOMPurify from "dompurify";


//get UI elems
const submitBtn = document.getElementById("user-submit-btn");
const userInputText = document.getElementById("user-input-text");

function start() {
    submitBtn.addEventListener("click", handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();

    const userPrompt = userInputText.value.trim();
    
    
}


start();