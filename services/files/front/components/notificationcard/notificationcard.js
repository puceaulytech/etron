class NotificationCard extends HTMLElement {
    constructor() {
        super();

        this.template = document.createElement("template");
        this.template.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    margin-bottom: 20px;
                    bottom: 0;
                    left: calc(50% - 150px);
                    min-width: 380px;
                    border: 2px solid green;
                    border-radius: 10px;
                    background-color: white;
                    animation-name: slide-in;
                    animation-duration: 1s;
                    animation-timing-function: ease-in-out;
                    cursor: pointer;
                }

                :host(.🌬️) {
                    animation-name: slide-out;
                    animation-duration: 0.6s;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                }

                .container {
                    display: flex;
                    gap: 10px;
                    padding: 20px;
                    align-items: center;
                    justify-content: space-between;
                }

                #notif-icon {
                    max-width: 20px;
                }

                #close-icon {
                    max-width: 24px;
                    border-radius: 5px;
                    transition: 100ms;
                }

                #close-icon:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                @keyframes slide-in {
                    0% { transform: translateY(400px); }
                    70% { transform: translateY(-30px); }
                    100% { transform: translateY(0); }
                }
                @keyframes slide-out {
                    0% { transform: translateY(0); }
                    30% { transform: translateY(-30px); }
                    100% { transform: translateY(400px); }
                }

                @media only screen and (max-width: 1000px) {
                    .container {
                        padding: 10px;
                    }
                }
            </style>

            <div class="container">
                <img id="notif-icon" />

                <span id="content"></span>

                <img id="close-icon" src="/assets/close-icon.svg" />
            </div>
        `;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(this.template.content.cloneNode(true));

        this.defaultIconSrc = "/assets/notification-icon.svg";

        this.container = shadow.querySelector(".container");
        this.contentElem = shadow.querySelector("#content");
        this.closeBtn = shadow.querySelector("#close-icon");
        this.notifIcon = shadow.querySelector("#notif-icon");

        this.updateIcon();

        this.closeEvent = new CustomEvent("close", {
            bubbles: true,
            cancelable: true,
        });

        this.actionEvent = new CustomEvent("action", {
            bubbles: true,
            cancelable: true,
        });
    }

    connectedCallback() {
        this.container.addEventListener("click", (event) => {
            if (event.target === this.closeBtn) {
                this.dispatchEvent(this.closeEvent);
            } else {
                this.dispatchEvent(this.actionEvent);
            }
        });
    }

    static get observedAttributes() {
        return ["content", "icon-src", "closing"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "content") {
            this.updateContent(newValue);
        } else if (name === "closing") {
            this.classList.add("🌬️");
        } else if (name === "icon-src") {
            this.updateIcon();
        }
    }

    updateContent(content) {
        this.contentElem.innerText = content;
    }

    updateIcon() {
        this.notifIcon.src = this.hasAttribute("icon-src")
            ? this.getAttribute("icon-src")
            : this.defaultIconSrc;
    }
}

customElements.define("notification-card", NotificationCard);
