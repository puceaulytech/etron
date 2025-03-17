class GameGrid extends HTMLElement {
    constructor() {
        super();

        this.wrappingDiv = document.createElement("div");
        this.wrappingDiv.id = "game";

        this.wrappingDiv.style.height = "100vh";
        this.wrappingDiv.style.width = "auto";

        this.canvas = document.createElement("canvas");
        this.canvas.id = "hexmap";

        this.wrappingDiv.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");

        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 3;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(this.wrappingDiv);
    }

    static get observedAttributes() {
        return ["grid"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "grid") {
            this.updateGrid(JSON.parse(newValue));
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    connectedCallback() {
        this.resizeCanvas();
        // FIXME
        // window.addEventListener("resize", () => this.resizeCanvas(), false);

        console.log(this.canvas.width, this.canvas.height);

        this.hexagonAngle = 0.523598776;
        this.sideLength = (this.canvas.width - 40) / (2 * 0.866 * BOARD_WIDTH);
        this.offset = 5;
        this.hexHeight = Math.sin(this.hexagonAngle) * this.sideLength;
        this.hexRadius = Math.cos(this.hexagonAngle) * this.sideLength;
        this.hexRectangleHeight = this.sideLength + 2 * this.hexHeight;
        this.hexRectangleWidth = 2 * this.hexRadius;

        if (this.hasAttribute("grid")) {
            this.updateGrid(this.getAttribute("grid"));
        }
    }

    updateGrid(grid) {
        this.drawBoard(grid);
    }

    drawBoard(board) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let filling;
                switch (board[i][j]) {
                    case -2:
                        filling = "#0362fc";
                        break;
                    case 2:
                        filling = "#f59c0c";
                        break;
                    case -1:
                        filling = "#062659";
                        break;
                    case 1:
                        filling = "#965e03";
                        break;
                    default:
                        filling = null;
                }
                this.drawHexagon(j, i, filling);
            }
        }
    }

    drawHexagon(x, y, filling) {
        const xStart = y % 2 === 0 ? 0 : this.hexRadius;
        x = x * this.hexRectangleWidth + xStart + this.offset;
        y = y * (this.sideLength + this.hexHeight) + this.offset;

        this.ctx.beginPath();
        this.ctx.moveTo(x + this.hexRadius, y);
        this.ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight);
        this.ctx.lineTo(
            x + this.hexRectangleWidth,
            y + this.hexHeight + this.sideLength,
        );
        this.ctx.lineTo(x + this.hexRadius, y + this.hexRectangleHeight);
        this.ctx.lineTo(x, y + this.sideLength + this.hexHeight);
        this.ctx.lineTo(x, y + this.hexHeight);
        this.ctx.closePath();

        if (filling) {
            this.ctx.fillStyle = filling;
            this.ctx.fill();
        }
        this.ctx.stroke();
    }
}

customElements.define("game-grid", GameGrid);
