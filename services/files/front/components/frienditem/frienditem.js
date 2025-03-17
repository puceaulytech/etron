class FriendItem extends HTMLElement {
    #usernameText;

    constructor() {
        super();

        const container = document.createElement("div");
        container.classList.add("container");
        container.style = `
        `;

        this.#usernameText = document.createElement("div");
        container.appendChild(this.#usernameText);

        const buttonContainer = document.createElement("div");
        buttonContainer.style = `
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            gap: 20px;
        `;
        const fightButton = document.createElement("div");
        const chatButton = document.createElement("div");
        const buttonStyle = `
            width: 20px;
            height: 20px;
            background-color: red;
        `;
        fightButton.style = buttonStyle;
        chatButton.style = buttonStyle;

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
                }
                .container:hover {
                    background-color: rgba(0, 0, 0, 0.2);
                }
            </style>
        `;
        shadow.append(container);
    }

    connectedCallback() {
        this.#usernameText.innerText = this.getUsername();
    }

    getUsername() {
        return this.getAttribute("username");
    }

    getUserId() {
        return this.getAttribute("user-id");
    }
}

customElements.define("friend-item", FriendItem);
