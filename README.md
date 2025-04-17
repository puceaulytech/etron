# eTron

<p align="center">
    <img width="20%" src="./services/files/front/assets/donkey-noborder.png" />
</p>

**eTron** is a fast-paced, 1v1 battle of strategy and reflexes on a hexagonal grid. Control your trail and outmaneuver your opponent, forcing them to crash into the arena's edge, their own trail, or yours. The last player standing wins—think fast, plan ahead, and don't get trapped!

## Play now!

Visit [https://etron.ps8.pns.academy](https://etron.ps8.pns.academy) to play now.

## Features

### 🕹️ Game Modes & Competition

- **Three Game Modes:** Play locally, against AI, or online.
- **ELO System:** Compete and rank up with an ELO-based rating system.
- **Rounds System:** Play best-of matches instead of single rounds.
- **Leaderboard:** Compare your ranking against other players.

### 👥 Social & Online Features

- **Friends System:**
    - Add friends and challenge them to a match.
    - Chat with friends in private messages.
    - Search users by username to send friend requests.
    - See which of your friends are online.
- **Emotes in Online Mode:** Taunt your opponent with in-game emotes.
- **Notifications:** Stay updated with in-game events and friend activity.
- **Chat with a Mysterious Bot:** One of the users is not like the others—talk to a hidden large language model that responds just like a real player.
- **Waiting Room Entertainment:** While waiting for an opponent in online mode, the game suggests a YouTube video to keep you entertained.

### 🎮 Controls

- **Multi-Input Support:** Play using a mouse or a controller.
- **Game Guide:** Learn the controls and game mechanics with a built-in tutorial.

### 🔒 Security & Account Management

- **Secure Password Recovery:** Recover your account using 2FA and one-time passwords.

## Run locally

Run:

```
docker compose up -d
```

And visit [http://localhost:8000](http://localhost:8000)

## Architecture

## Back-End Architecture Strategy

### Microservice Breakdown

Our back-end architecture consists of five microservices:

- **Auth**: Handles account creation, login, registration, and JWT token management. It’s kept stateless and isolated for easier scaling and security.

- **Files**: A simple file server used for uploading and serving user content (e.g., avatars). Isolated to separate heavy file I/O from core services.

- **Social**: Manages all friend-related features, chat, and notifications. Given the complexity of real-time social interactions, this service deserved its own scope.

- **Game Service (`gamesvc`)**: Runs all in-game logic and AI. It’s the only microservice that directly communicates with clients via socket.io.

- **Gateway**: Acts as a reverse proxy, routing all client traffic to the appropriate service, handling CORS, and doing token verification for protected routes.

We deliberately kept the number of services low to avoid the overhead of over-microservicing. Splitting the system into **auth**, **social**, and **game** made the most sense to us, as these are the core domains of the game.

---

### Communication Strategy

Most communication happens over HTTP. It’s straightforward, stateless, and easy to reason about for RESTful endpoints like login, friend requests, and file uploads.

However, two areas required WebSockets):

1. **In-Game Communication (`gamesvc`)**:

    - The client connects via Socket.io when a match begins.
    - Moves are sent to the server, and game state/emotes are pushed back in real-time.
    - This ensures low-latency interaction and a responsive game experience.

2. **Notifications (`social`)**:
    - On the main page, the client maintains a WebSocket connection to receive friend invites, challenges, etc.
    - Pushing this data avoids constant polling and improves UX.

---

### WebSocket accross microservices

One architectural hurdle we faced was how to emit WebSocket events to clients when the originating event came from a different microservice. Socket.io maintains a client connection in-memory, which means only the service that holds the connection (in our case, `gamesvc`) can send messages to that client.

Rather than introducing a Redis or MongoDB socket.io adapter (because additional libraries were not allowed), we found a leaner solution using MongoDB change streams:

- We enabled sharding mode and used a `notifications` collection.
- Whenever a service (like `social`) wanted to send a message to a connected client, it simply inserted a document into that collection.
- `gamesvc` listens to the collection via MongoDB’s collection subscription (change stream) feature, picks up new documents, and emits them to the correct client via socket.io.

This solution allowed us to decouple message emission from service ownership of the socket connection.

## License

eTron is distributed under [AGPL-3.0-only](LICENSE).

<p align="center">
    Made by <a href="https://github.com/romch007">Romain Chardiny</a> and <a href="https://github.com/QwEekYhyo">Logan Lucas</a>
</p>
