const leaderboardItems = document.getElementById("leaderboard-items");

async function updateLeaderboard() {
    const resp = await fetch("/api/social/leaderboard", { method: "GET" });

    const leaderboard = await resp.json();

    for (const userInfo of leaderboard) {
        const itemDiv = document.createElement("div");
        itemDiv.style.display = "flex";

        const usernameDiv = document.createElement("div");
        usernameDiv.innerText = userInfo.username;

        const spacer = document.createElement("div");
        spacer.style.flexGrow = 1;

        const eloDiv = document.createElement("div");
        eloDiv.innerText = Math.floor(userInfo.elo).toString();

        itemDiv.appendChild(usernameDiv);
        itemDiv.appendChild(spacer);
        itemDiv.appendChild(eloDiv);

        leaderboardItems.appendChild(itemDiv);
    }
}
