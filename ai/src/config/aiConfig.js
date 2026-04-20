const aiConfig = {
    ollama: {
        baseUrl: "http://localhost:11434/api/generate",
        defaultModel: "tinyllama", 
        maxRetries: 3
    }
};

export default aiConfig;
