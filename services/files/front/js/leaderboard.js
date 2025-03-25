const leaderboardItems = document.getElementById("leaderboard-items");

async function updateLeaderboard() {
    const resp = await fetch("/api/social/leaderboard", { method: "GET" });

    const leaderboard = await resp.json();

    let rank = 0;

    for (const userInfo of leaderboard) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("leaderboard-item");

        const usernameDiv = document.createElement("div");
        usernameDiv.innerText = userInfo.username;

        const spacer = document.createElement("div");
        spacer.style.flexGrow = 1;

        const eloDiv = document.createElement("div");
        eloDiv.innerText = Math.floor(userInfo.elo).toString();

        if (rank === 0) {
            eloDiv.style.color = "#ffd700";
        } else if (rank === 1) {
            eloDiv.style.color = "#c0c0c0";
        } else if (rank === 2) {
            eloDiv.style.color = "rgb(255, 127, 0)";
        }

        itemDiv.appendChild(usernameDiv);
        itemDiv.appendChild(spacer);
        itemDiv.appendChild(eloDiv);

        leaderboardItems.appendChild(itemDiv);

        rank++;
    }
}

updateLeaderboard();
