class KeyboardControls extends HTMLElement {
    constructor() {
        super();

        this.template = document.createElement("template");
        this.template.innerHTML = `
    <style>
        #container {
            background-color: green;
            border-radius: 10px;
            width: 200px;
            height: 200px;
            position: relative;
        }

        .control {
            position: absolute;
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
            border: 1px solid black;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: bold;
        }

        .hex-controls {
            position: absolute;
            left: 25%;
            top: 25%;
            width: 100px;
            height: 100px;
        }

        .top-right { left: 70%; top: 15%; }
        .right { right: 5%; bottom: 45%; }
        .bottom-right { left: 70%; bottom: 15%; }
        .bottom-left { right: 70%; bottom: 15%; }
        .left { left: 5%; bottom: 45%; }
        .top-left { right: 70%; top: 15%; }
    </style>

    <div id="container">
        <svg
            class="hex-controls"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M 50,0
                      L 0,25
                      L 0,75
                      L 50,100
                      L 100,75
                      L 100,25
                      L 50,0"
            />
        </svg>
        <div class="control top-right">@</div>
        <div class="control right">@</div>
        <div class="control bottom-right">@</div>
        <div class="control bottom-left">@</div>
        <div class="control left">@</div>
        <div class="control top-left">@</div>
    </div>
`;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(this.template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["keys"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "keys") {
            this.updateKeys(newValue);
        }
    }

    connectedCallback() {
        if (this.hasAttribute("keys")) {
            this.updateKeys(this.getAttribute("keys"));
        }
    }

    updateKeys(keys) {
        const keyArray = keys.split(",");
        const controls = this.shadowRoot.querySelectorAll(".control");
        controls.forEach((control, index) => {
            control.textContent = keyArray[index] || "";
        });
    }
}

customElements.define("keyboard-controls", KeyboardControls);
