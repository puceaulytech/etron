class FriendItem extends HTMLElement {
    #usernameText;

    constructor() {
        super();

        const container = document.createElement("div");
        container.classList.add("container");

        this.onlineMarker = document.createElement("div");
        this.onlineMarker.style = `
            min-width: 10px;
            min-height: 10px;
            background-color: gray;
            border-radius: 50%;
        `;
        container.appendChild(this.onlineMarker);

        this.#usernameText = document.createElement("div");
        container.appendChild(this.#usernameText);

        this.eloText = document.createElement("div");
        this.eloText.style.fontSize = "15px";
        container.appendChild(this.eloText);

        this.spacer = document.createElement("div");
        this.spacer.style.flexGrow = 1;
        container.appendChild(this.spacer);

        const imageSize = 25;

        this.fightButton = document.createElement("div");
        this.chatButton = document.createElement("div");

        this.fightButton.classList.add("button");
        this.chatButton.classList.add("button", "chat-button");

        this.fightButton.title = "Challenge friend";
        this.chatButton.title = "Chat with friend";

        this.fightIconPath = "/assets/fight-icon.svg";
        this.feedbackIconPath = "/assets/check.png";

        this.fightIcon = new Image(imageSize, imageSize);
        this.fightIcon.src = this.fightIconPath;
        this.fightIcon.alt = "Fight icon";

        this.chatIcon = new Image(imageSize, imageSize);
        this.chatIcon.src = "/assets/chat-icon.svg";
        this.chatIcon.alt = "Chat icon";

        this.fightButton.appendChild(this.fightIcon);
        this.fightButton.addEventListener("click", this.challenge.bind(this));

        this.chatButton.appendChild(this.chatIcon);
        this.chatButton.addEventListener("click", this.chat.bind(this));

        container.appendChild(this.fightButton);
        container.appendChild(this.chatButton);

        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                :host {
                    width: 100%;
                    height: 75px;
                }
                .container {
                    height: 75px;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px 0 20px;
                    margin: 0 20px 0 20px;
                    border-bottom: 1px solid black;
                    font-size: 22px;
                    gap: 20px;
                }
                .container:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                .button {
                    width: ${imageSize + 10}px;
                    height: ${imageSize + 10}px;
                    border-radius: 10%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .button:hover {
                    background-color: rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                }
                .chat-button {
                    position: relative;
                }
                .chat-button.unread::after {
                    content: "";
                    position: absolute;
                    top: 5px;
                    right: 4px;
                    width: 8px;
                    height: 8px;
                    background-color: red;
                    border-radius: 50%;
                }
            </style>
        `;
        shadow.append(container);
    }

    static get observedAttributes() {
        return ["online", "challenge-feedback", "unread-msg"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "online") {
            this.setOnline(newValue !== null);
        } else if (name === "challenge-feedback") {
            this.setChallengeFeedback(newValue !== null);
        } else if (name === "unread-msg") {
            this.setUnread(newValue !== null);
        }
    }

    connectedCallback() {
        this.#usernameText.innerText = this.getUsername();
        if (!this.getAttribute("user-elo")) {
            this.eloText.remove();
        } else {
            this.eloText.innerText = this.displayElo();
        }
    }

    setChallengeFeedback(active) {
        this.fightIcon.src = active
            ? this.feedbackIconPath
            : this.fightIconPath;
    }

    setOnline(val) {
        if (val) {
            this.onlineMarker.style.backgroundColor = "green";
        } else {
            this.onlineMarker.style.backgroundColor = "gray";
        }
    }

    setUnread(val) {
        if (val) {
            this.chatButton.classList.add("unread");
        } else {
            this.chatButton.classList.remove("unread");
        }
    }

    getUsername() {
        return this.getAttribute("username");
    }

    displayElo() {
        return `ELO: ${Math.floor(this.getUserElo())}`;
    }

    getUserElo() {
        return Number(this.getAttribute("user-elo"));
    }

    getUserId() {
        return this.getAttribute("user-id");
    }

    chat() {
        openChat(this.getUsername(), this.getUserId());
    }

    challenge() {
        challengeFriend(this.getUserId());
    }
}

customElements.define("friend-item", FriendItem);
