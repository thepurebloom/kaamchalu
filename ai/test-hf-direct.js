
import fetch from "node-fetch";

import dotenv from "dotenv";
dotenv.config();

const token = process.env.HF_API_TOKEN;
const model = "distilbert-base-uncased-finetuned-sst-2-english";

if (!token) {
    console.error("❌ ERROR: HF_API_TOKEN is missing in environment variables.");
    process.exit(1);
}

async function test() {
    console.log(`Testing HF with ${model}...`);
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: "I love this product" })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
}

test();
