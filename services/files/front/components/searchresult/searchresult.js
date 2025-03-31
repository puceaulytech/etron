class SearchResult extends HTMLElement {
    #shadowRoot;
    #template;
    #usernameElement;
    #addFriendButton;

    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: "open" });

        this.#template = document.createElement("template");
        this.#template.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    background-color: #f0f0f0;
                    border-radius: 8px;
                    padding: 10px;
                    margin: 10px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .username {
                    font-weight: bold;
                    font-size: larger;
                    flex-grow: 1;
                }
                .add-friend-btn {
                    background-color: #008000;
                    color: white;
                    border: none;
                    width: 25%;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 500;
                }
                .add-friend-btn:hover {
                    background-color: #055205;
                }
            </style>
            <span class="username"></span>
            <button class="add-friend-btn">Add friend</button>
        `;
        const content = this.#template.content.cloneNode(true);
        this.#shadowRoot.appendChild(content);
    }

    connectedCallback() {
        this.#usernameElement = this.#shadowRoot.querySelector(".username");
        this.#addFriendButton =
            this.#shadowRoot.querySelector(".add-friend-btn");

        this.#updateUsername();

        this.#addFriendButton.addEventListener(
            "click",
            this.#onAddFriend.bind(this),
        );
    }

    static get observedAttributes() {
        return ["username", "user-id"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "username") {
            this.#updateUsername();
        }
    }

    #updateUsername() {
        if (this.#usernameElement) {
            this.#usernameElement.textContent =
                this.getAttribute("username") || "Unknown User";
        }
    }

    #onAddFriend() {
        const userId = this.getAttribute("user-id");
        authenticatedFetch("/api/social/friends", {
            method: "POST",
            body: JSON.stringify({ newFriendId: userId }),
        }).then((res) => {
            if (res.ok) {
                this.#addFriendButton.textContent = "Added!";
                setTimeout(() => {
                    this.#addFriendButton.textContent = "Add friend";
                }, 1000);
            }
        });
    }
}

customElements.define("search-result", SearchResult);
