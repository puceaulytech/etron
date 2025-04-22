class GameJoystick extends HTMLElement {
    #angle;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.position = { x: 0, y: 0 };
        this.isActive = false;
        this.maxDistance = 50;
        this.baseSize = 120;
        this.stickSize = 50;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: ${this.baseSize}px;
                    height: ${this.baseSize}px;
                    position: relative;
                    touch-action: none;
                }
                
                .joystick-base {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: rgba(128, 128, 128, 0.4);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
                }
                
                .joystick-stick {
                    width: ${this.stickSize}px;
                    height: ${this.stickSize}px;
                    border-radius: 50%;
                    background-color: rgba(100, 100, 100, 0.8);
                    position: absolute;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: transform 0.1s ease-out;
                    transform: translate(0px, 0px);
                }
            </style>
            <div class="joystick-base">
                <div class="joystick-stick"></div>
            </div>
        `;

        this.base = this.shadowRoot.querySelector(".joystick-base");
        this.stick = this.shadowRoot.querySelector(".joystick-stick");

        this.centerX = this.baseSize / 2;
        this.centerY = this.baseSize / 2;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.base.addEventListener("mousedown", this.handleStart.bind(this));
        document.addEventListener("mousemove", this.handleMove.bind(this));
        document.addEventListener("mouseup", this.handleEnd.bind(this));

        this.base.addEventListener("touchstart", this.handleStart.bind(this));
        document.addEventListener("touchmove", this.handleMove.bind(this));
        document.addEventListener("touchend", this.handleEnd.bind(this));
        document.addEventListener("touchcancel", this.handleEnd.bind(this));
    }

    handleStart(e) {
        e.preventDefault();
        this.isActive = true;
        this.handleMove(e);
    }

    handleMove(e) {
        if (!this.isActive) return;
        e.preventDefault();

        let clientX, clientY;

        if (e.type.startsWith("touch")) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = this.base.getBoundingClientRect();
        const baseX = rect.left + this.centerX;
        const baseY = rect.top + this.centerY;

        let deltaX = clientX - baseX;
        let deltaY = clientY - baseY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > this.maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            this.#angle = angle;
            deltaX = Math.cos(angle) * this.maxDistance;
            deltaY = Math.sin(angle) * this.maxDistance;
        }

        this.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        this.position.x = parseFloat((deltaX / this.maxDistance).toFixed(2));
        this.position.y = parseFloat((deltaY / this.maxDistance).toFixed(2));

        this.dispatchEvent(
            new CustomEvent("joystick-move", {
                detail: {
                    x: this.position.x,
                    y: this.position.y,
                    angle: this.#angle,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    handleEnd(e) {
        if (!this.isActive) return;
        e.preventDefault();
        this.isActive = false;

        this.stick.style.transform = `translate(0px, 0px)`;
        this.position = { x: 0, y: 0 };

        this.dispatchEvent(
            new CustomEvent("joystick-move", {
                detail: {
                    x: 0,
                    y: 0,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    get joystickPosition() {
        return { ...this.position };
    }
}

customElements.define("game-joystick", GameJoystick);
