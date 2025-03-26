class AppDialog extends HTMLElement {
    constructor() {
        super();

        this.template = document.createElement("template");
        this.template.innerHTML = `
            <style>
                :host {
                    display: flex;
                    visibility: hidden;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.5);
                    transition: background 200ms;
                }

                .dialog {
                    background: white;
                    padding: 10px;
                    border-radius: 10px;
                    border: 4px solid green;
                    min-width: 400px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    font-size: 20px;
                    transform: scale(0);
                    transition: transform 200ms;
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

        this.dialogDiv = shadow.querySelector(".dialog");

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
        if (show) {
            this.style.visibility = "visible";
            this.style.background = "rgba(0, 0, 0, 0.5)";
            this.dialogDiv.style.transform = "scale(1)";
        } else {
            this.style.background = "rgba(0, 0, 0, 0)";
            this.dialogDiv.style.transform = "scale(0)";

            // Avoid hiding the dialog too fast, it messes up the animation
            setTimeout(() => {
                this.style.visibility = "hidden";
            }, 500);
        }
    }

    updateContent(text) {
        this.contentElement.innerText = text;
    }
}

customElements.define("app-dialog", AppDialog);
