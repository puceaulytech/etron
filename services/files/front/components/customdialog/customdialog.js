class AppDialogCustom extends HTMLElement {
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
                    z-index: 1000;
                    width: 100dvw;
                    height: 100dvh;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.5);
                    transition: background 200ms;
                }
                .dialog {
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    border: 4px solid green;
                    min-width: 400px;
                    max-width: 80%;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    font-size: 1rem;
                    transform: scale(0);
                    transition: transform 200ms;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 15px;
                }
                .dialog-header {
                    text-align: center;
                }
                .dialog-body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .dialog-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                #content {
                    margin: 0;
                }

                @media only screen and (max-width: 1000px) {
                    .dialog {
                        width: 100dvw !important;
                        height: 100dvh !important;
                        max-width: unset !important;
                    }
                }
            </style>
            <div class="dialog">
                <div class="dialog-header">
                    <h2 id="content">Dialog Title</h2>
                </div>
                <div class="dialog-body">
                    <slot name="body"></slot>
                </div>
                <slot name="outer"></slot>
                <div class="dialog-buttons">
                    <slot name="buttons"></slot>
                </div>
            </div>
        `;
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(this.template.content.cloneNode(true));
        this.dialogDiv = shadow.querySelector(".dialog");
        this.contentElement = shadow.querySelector("#content");
    }

    connectedCallback() {
        this.toggleShow(this.hasAttribute("show"));

        if (!this.hasAttribute("modal")) {
            this.addEventListener("click", (e) => {
                const path = e.composedPath();

                if (path[0] === this) this.removeAttribute("show");
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") this.removeAttribute("show");
            });
        }

        if (this.hasAttribute("app-max-width")) {
            this.dialogDiv.style.maxWidth = this.getAttribute("app-max-width");
        }
    }

    static get observedAttributes() {
        return ["show", "content", "modal", "max-width"];
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
customElements.define("app-dialog-custom", AppDialogCustom);
