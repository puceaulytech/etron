const template = document.createElement("template");
template.innerHTML = `
    <style>
        #container {
            background-color: red;
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
            font-size: 14px;
            font-weight: bold;
        }
        ::slotted(*) {
            position: absolute;
            left: 25%;
            top: 25%;
        }

        .top-right { left: 70%; top: 15%; }
        .right { right: 5%; bottom: 45%; }
        .bottom-right { left: 70%; bottom: 15%; }
        .bottom-left { right: 70%; bottom: 15%; }
        .left { left: 5%; bottom: 45%; }
        .top-left { right: 70%; top: 15%; }
    </style>

    <div id="container">
        <slot></slot>
        <div class="control top-right">E</div>
        <div class="control right">D</div>
        <div class="control bottom-right">X</div>
        <div class="control bottom-left">W</div>
        <div class="control left">Q</div>
        <div class="control top-left">Z</div>
    </div>
`;

class KeyboardControls extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(template.content.cloneNode(true));
    }
}

customElements.define("keyboard-controls", KeyboardControls);
