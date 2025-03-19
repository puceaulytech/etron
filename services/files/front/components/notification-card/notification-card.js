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
                    min-width: 300px;
                    border: 2px solid green;
                    border-radius: 10px;
                    background-color: white;
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
                    cursor: pointer;
                }
            </style>

            <div class="container">
                <img id="notif-icon" src="../../assets/notification-icon.svg" />

                <span id="content"></span>

                <img id="close-icon" src="../../assets/close-icon.svg" />
            </div>
        `;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(this.template.content.cloneNode(true));

        this.contentElem = shadow.querySelector("#content");
        this.closeBtn = shadow.querySelector("#close-icon");

        this.closeEvent = new CustomEvent("close", {
            bubbles: true,
            cancelable: true,
        });
    }

    connectedCallback() {
        this.closeBtn.addEventListener("click", () => {
            this.dispatchEvent(this.closeEvent);
        });
    }

    static get observedAttributes() {
        return ["content"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "content") {
            this.updateContent(newValue);
        }
    }

    updateContent(content) {
        this.contentElem.innerText = content;
    }
}

customElements.define("notification-card", NotificationCard);
