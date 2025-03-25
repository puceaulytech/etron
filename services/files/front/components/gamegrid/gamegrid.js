class GameGrid extends HTMLElement {
    constructor() {
        super();

        this.donkeyImg = new Image();
        this.donkeyImg.src = "../assets/donkey.png";

        this.merdeImg = new Image();
        this.merdeImg.src = "../assets/merde.png";

        this.wrappingDiv = document.createElement("div");
        this.wrappingDiv.id = "game";

        this.wrappingDiv.style = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        if (this.getAttribute("crosshair") !== undefined) {
            this.wrappingDiv.style.cursor = "crosshair";
        }

        this.canvas = document.createElement("canvas");
        this.canvas.id = "hexmap";

        this.wrappingDiv.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 3;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(this.wrappingDiv);

        this.somePlayerArrayPos = { x: -69, y: -69 };
    }

    static get observedAttributes() {
        return ["grid", "inverted", "playerpos"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "grid") {
            this.updateGrid(JSON.parse(newValue));
        }
    }

    isInverted() {
        return this.getAttribute("inverted") !== null;
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;

        this.hexagonAngle = 0.523598776;
        this.sideLength = (this.canvas.width - 40) / (2 * 0.866 * BOARD_WIDTH);
        this.offset = 5;
        this.hexHeight = Math.sin(this.hexagonAngle) * this.sideLength;
        this.hexRadius = Math.cos(this.hexagonAngle) * this.sideLength;
        this.hexRectangleHeight = this.sideLength + 2 * this.hexHeight;
        this.hexRectangleWidth = 2 * this.hexRadius;

        this.canvas.height = BOARD_HEIGHT * this.hexRadius * 2;

        if (this.hasAttribute("grid")) this.redrawGrid();
    }

    connectedCallback() {
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas(), false);

        if (this.hasAttribute("grid")) this.redrawGrid();
    }

    redrawGrid() {
        this.updateGrid(JSON.parse(this.getAttribute("grid")));
    }

    updateGrid(grid) {
        this.drawBoard(grid);
    }

    drawBoard(board) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let filling;
                switch (board[i][j]) {
                    default:
                        filling = "#3caf3c";
                }
                let image;
                switch (board[i][j]) {
                    case -2:
                    case 2:
                        image = this.donkeyImg;
                        break;
                    case -1:
                    case 1:
                        image = this.merdeImg;
                        break;
                }
                this.drawHexagon(j, i, filling, image);
            }
        }
    }

    drawHexagon(x, y, filling, img) {
        const rowWidth = y % 2 == 0 ? BOARD_WIDTH : BOARD_WIDTH - 1;
        const isInverted = this.isInverted();
        if (isInverted) x = rowWidth - 1 - x;

        const xStart = y % 2 === 0 ? 0 : this.hexRadius;
        const newX = x * this.hexRectangleWidth + xStart + this.offset;
        const newY = y * (this.sideLength + this.hexHeight) + this.offset;

        const rowsColumnsThingy = JSON.parse(this.getAttribute("playerpos"));
        this.somePlayerArrayPos = {
            x: isInverted
                ? rowWidth - 1 - rowsColumnsThingy.column
                : rowsColumnsThingy.column,
            y: rowsColumnsThingy.row,
        };
        if (
            this.somePlayerArrayPos.x === x &&
            this.somePlayerArrayPos.y === y &&
            img === this.donkeyImg
        ) {
            this.somePlayerPos = {
                x: newX + this.hexRadius,
                y: newY + this.hexRadius,
            };
        }

        this.ctx.beginPath();
        this.ctx.moveTo(newX + this.hexRadius, newY);
        this.ctx.lineTo(newX + this.hexRectangleWidth, newY + this.hexHeight);
        this.ctx.lineTo(
            newX + this.hexRectangleWidth,
            newY + this.hexHeight + this.sideLength,
        );
        this.ctx.lineTo(newX + this.hexRadius, newY + this.hexRectangleHeight);
        this.ctx.lineTo(newX, newY + this.sideLength + this.hexHeight);
        this.ctx.lineTo(newX, newY + this.hexHeight);
        this.ctx.closePath();

        if (filling) {
            this.ctx.fillStyle = filling;
            this.ctx.fill();
        }
        this.ctx.stroke();

        if (img) {
            this.ctx.drawImage(
                img,
                newX,
                newY,
                this.hexRectangleWidth,
                this.hexRectangleHeight,
            );
            return;
        }
    }
}

customElements.define("game-grid", GameGrid);
