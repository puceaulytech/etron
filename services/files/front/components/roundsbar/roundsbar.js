class RoundsBar extends HTMLElement {
    constructor() {
        super();

        this.leftColor = "#00ff00";
        this.rightColor = "#ff0000";

        this.template = document.createElement("template");
        this.template.innerHTML = `
        <style>
         .rounds-container {
           display: flex;
           flex-direction: row;
           gap: 20px;
         }
         
         .rounds-spacer {
           width: 50px;
         }
         
         .rounds-indicator {
           border: 2px solid black;
           width: 40px;
           height: 40px;
           border-radius: 50%;
         }
         
         .not-won {
            border: 2px dashed black;
         }
         </style>

        <div class="rounds-container">
            <div class="rounds-indicator not-won"></div>
            <div class="rounds-indicator not-won"></div>
            <div class="rounds-indicator not-won"></div>
  
            <div class="rounds-spacer"></div>
  
            <div class="rounds-indicator not-won"></div>
            <div class="rounds-indicator not-won"></div>
            <div class="rounds-indicator not-won"></div>
        </div>
        `;

        const shadow = this.attachShadow({ mode: "open" });

        shadow.appendChild(this.template.content.cloneNode(true));

        this.indicators = Array.from(
            shadow.querySelectorAll(".rounds-indicator"),
        );

        this.setLeftRounds(Number(this.getAttribute("left-rounds")));
        this.setRightRounds(Number(this.getAttribute("right-rounds")));
    }

    static get observedAttributes() {
        return ["left-rounds", "right-rounds"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "left-rounds") {
            this.setLeftRounds(Number(newValue));
        } else if (name === "right-rounds") {
            this.setRightRounds(Number(newValue));
        }
    }

    fillIndicator(indic, color) {
        indic.classList.remove("not-won");
        indic.style.backgroundColor = color;
        indic.style.borderColor = color;
    }

    setLeftRounds(rounds) {
        const toUpdate = this.indicators.slice(3 - rounds, 3);

        for (const indic of toUpdate) this.fillIndicator(indic, this.leftColor);
    }

    setRightRounds(rounds) {
        const toUpdate = this.indicators.slice(3, 3 + rounds);

        for (const indic of toUpdate)
            this.fillIndicator(indic, this.rightColor);
    }
}

customElements.define("rounds-bar", RoundsBar);
