class AppDialog extends HTMLElement {
    constructor() {
        super();

        this.template = document.createElement("template");
        this.template.innerHTML = `
            <style>
                :host {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 1000;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    justify-content: center;
                    align-items: center;
                }

                .dialog {
                    background: white;
                    padding: 10px;
                    border-radius: 10px;
                    border: 4px solid green;
                    min-width: 400px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    font-size: 20px;
                }

                .dialog-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
            </style>

            <div class="dialog">
                <p id="content">This is a title</p>

                <slot class="dialog-buttons" name="buttons"></slot>
            </div>
        `;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(this.template.content.cloneNode(true));

        this.contentElement = shadow.querySelector("#content");
    }

    connectedCallback() {
        this.toggleShow(this.hasAttribute("show"));
    }

    static get observedAttributes() {
        return ["show", "content"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "show") {
            this.toggleShow(this.hasAttribute("show"));
        } else if (name === "content") {
            this.updateContent(newValue);
        }
    }

    toggleShow(show) {
        const displayVal = show ? "flex" : "none";

        this.style.display = displayVal;
    }

    updateContent(text) {
        this.contentElement.innerText = text;
    }
}

customElements.define("app-dialog", AppDialog);
