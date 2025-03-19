class FriendItem extends HTMLElement {
    #usernameText;

    constructor() {
        super();

        const container = document.createElement("div");
        container.classList.add("container");
        container.style = `
            
        `;

        this.onlineMarker = document.createElement("div");
        this.onlineMarker.style = `
            min-width: 10px;
            min-height: 10px;
            background-color: red;
            border-radius: 50%;
        `;
        container.appendChild(this.onlineMarker);

        this.#usernameText = document.createElement("div");
        container.appendChild(this.#usernameText);

        this.spacer = document.createElement("div");
        this.spacer.style.width = "100%";
        container.appendChild(this.spacer);

        const buttonContainer = document.createElement("div");
        buttonContainer.style = `
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            gap: 20px;
        `;
        const imageSize = 30;
        const fightButton = document.createElement("div");
        const chatButton = document.createElement("div");
        const buttonStyle = `
            width: ${imageSize}px;
            height: ${imageSize}px;
        `;
        fightButton.style = buttonStyle;
        chatButton.style = buttonStyle;

        const fightIcon = new Image(imageSize, imageSize);
        fightIcon.src = "../../assets/fight-icon.svg";
        fightIcon.alt = "Fight icon";
        const chatIcon = new Image(imageSize, imageSize);
        chatIcon.src = "../../assets/chat-icon.svg";
        chatIcon.alt = "Chat icon";

        fightButton.appendChild(fightIcon);
        chatButton.appendChild(chatIcon);
        buttonContainer.appendChild(fightButton);
        buttonContainer.appendChild(chatButton);
        container.appendChild(buttonContainer);

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
                    background-color: rgba(0, 0, 0, 0.2);
                }
            </style>
        `;
        shadow.append(container);
    }

    static get observedAttributes() {
        return ["online"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "online") {
            this.setOnline(newValue !== null);
        }
    }

    connectedCallback() {
        this.#usernameText.innerText = this.getUsername();
    }

    setOnline(val) {
        if (val) {
            this.onlineMarker.style.backgroundColor = "green";
        } else {
            this.onlineMarker.style.backgroundColor = "red";
        }
    }

    getUsername() {
        return this.getAttribute("username");
    }

    getUserId() {
        return this.getAttribute("user-id");
    }
}

customElements.define("friend-item", FriendItem);
