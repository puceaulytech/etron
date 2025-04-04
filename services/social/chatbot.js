const BOT_USERNAME = process.env["BOT_USERNAME"];

const ollamaApi = process.env["OLLAMA_API"];
const ollamaUsername = process.env["OLLAMA_USERNAME"];
const ollamaPassword = process.env["OLLAMA_PASSWORD"];
const ollamaBearer = process.env["OLLAMA_BEARER"];
const ollamaModel = process.env["OLLAMA_MODEL"] ?? "mistral";

const preambule = `You are a fake user in a Tron game called eTron, made by Romain Chardiny and Logan Lucas. The overall theme of the game is donkeys, you are supposed to also be a donkey but that has the ability to talk. Your name is ${BOT_USERNAME}. Try to keep the replies somewhat short. `;

async function generateMessage(username, conversation) {
    if (!ollamaApi) return;

    conversation.unshift({
        role: "system",
        content: preambule + `The person you are talking to is ${username}`,
    });

    console.log(conversation);

    const headers = new Headers();

    headers.append("Content-Type", "application/json");

    if (ollamaUsername && ollamaPassword) {
        headers.append(
            "Authorization",
            "Basic " +
                Buffer.from(ollamaUsername + ":" + ollamaPassword).toString(
                    "base64",
                ),
        );
    }

    if (ollamaBearer) {
        headers.append("Authorization", "Bearer " + ollamaBearer);
    }

    const resp = await fetch(`${ollamaApi}/api/chat`, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
            model: ollamaModel,
            messages: conversation,
            stream: false,
        }),
    });

    const body = await resp.json();

    console.log(body);

    return body.message.content;
}

module.exports = { generateMessage };
