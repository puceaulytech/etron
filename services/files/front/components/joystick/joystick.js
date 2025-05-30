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

        this.activeTouchId = null;

        this._handleAppear = this.handleAppear.bind(this);
        this._handleMove = this.handleMove.bind(this);
        this._handleEnd = this.handleEnd.bind(this);
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    disconnectedCallback() {
        document.removeEventListener("mousemove", this._handleMove);
        document.removeEventListener("mouseup", this._handleEnd);
        document.removeEventListener("touchstart", this._handleAppear);
        document.removeEventListener("touchmove", this._handleMove);
        document.removeEventListener("touchend", this._handleEnd);
        document.removeEventListener("touchcancel", this._handleEnd);
    }

    setupEventListeners() {
        this.base.addEventListener("mousedown", this._handleStart);
        document.addEventListener("mousemove", this._handleMove);
        document.addEventListener("mouseup", this._handleEnd);

        document.addEventListener("touchstart", this._handleAppear);
        document.addEventListener("touchmove", this._handleMove);
        document.addEventListener("touchend", this._handleEnd);
        document.addEventListener("touchcancel", this._handleEnd);
    }

    handleAppear(event) {
        if (this.isActive) return;

        event.preventDefault();

        const touch = event.changedTouches[0];
        this.activeTouchId = touch.identifier ?? null;

        this.dispatchEvent(
            new CustomEvent("joystick-appear", {
                detail: {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY,
                },
                bubbles: true,
                composed: true,
            }),
        );

        this.isActive = true;
        this.handleMove(event);
    }

    handleMove(e) {
        let found = false;

        if (e.changedTouches) {
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.activeTouchId) {
                    found = true;
                    break;
                }
            }
        }

        if (!found || !this.isActive) return;
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

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

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
        let found = false;

        if (e.changedTouches) {
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.activeTouchId) {
                    found = true;
                    break;
                }
            }
        }

        if (!found) return;

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

        this.dispatchEvent(
            new CustomEvent("joystick-disappear", {
                bubbles: true,
                composed: true,
            }),
        );

        this.activeTouchId = null;
    }

    get joystickPosition() {
        return { ...this.position };
    }
}

customElements.define("game-joystick", GameJoystick);
