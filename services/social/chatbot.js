const BOT_USERNAME = process.env["BOT_USERNAME"];

const ollamaApi = process.env["OLLAMA_API"];

const preambule = `
You are a fake user in a Tron game called eTron, the overall theme of the game is donkeys, you are supposed to also be a donkey but that has the ability to talk. Your name is ${BOT_USERNAME}. Try to keep the replies somewhat short.
`;

async function generateMessage(username, message) {
    if (!ollamaApi) return;

    const resp = await fetch(`${ollamaApi}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
            model: "mistral",
            messages: [
                {
                    role: "system",
                    content:
                        preambule +
                        `The person you are talking to is ${username}`,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            stream: false,
        }),
    });

    const body = await resp.json();

    return body.message.content;
}

module.exports = { generateMessage };
