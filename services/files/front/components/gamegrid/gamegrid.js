class GameGrid extends HTMLElement {
    constructor() {
        super();

        this.donkeyImg = new Image();
        this.donkeyImg.src = "../assets/donkey.png";

        this.merdeImg = new Image();
        this.merdeImg.src = "../assets/merde.png";

        this.footprintImg = new Image();
        this.footprintImg.src = "../assets/footprint.png";

        this.footprintImgRed = new Image();
        this.footprintImgRed.src = "../assets/footprint-red.png";

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
        this.canvas.style = ` 
            border-radius: 10px;
        `;
        this.canvas.id = "hexmap";

        this.wrappingDiv.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 5;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(this.wrappingDiv);

        this.somePlayerArrayPos = { x: -69, y: -69 };
        this.tileColor = "#3caf3c";
    }

    static get observedAttributes() {
        return ["grid", "inverted", "playerpos", "nextmousepos"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "grid") {
            this.updateGrid(JSON.parse(newValue));
        } else if (name === "nextmousepos") {
            this.redrawGrid();
        }
    }

    isInverted() {
        return this.getAttribute("inverted") !== null;
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;

        this.hexagonAngle = 0.523598776;
        this.sideLength = (this.canvas.width - 20) / (2 * 0.866 * BOARD_WIDTH);
        this.hexHeight = Math.sin(this.hexagonAngle) * this.sideLength;
        this.hexRadius = Math.cos(this.hexagonAngle) * this.sideLength;
        this.hexRectangleHeight = this.sideLength + 2 * this.hexHeight;
        this.hexRectangleWidth = 2 * this.hexRadius;

        this.canvas.height = BOARD_HEIGHT * this.hexRadius * 2;

        this.offsetX = (this.canvas.width - BOARD_WIDTH * this.hexRectangleWidth) / 2;

        const hexRectangleHeightCount = Math.floor((BOARD_HEIGHT + 1) / 2);
        const sideLengthCount = Math.floor(BOARD_HEIGHT / 2);

        this.offsetY = (this.canvas.height - ((hexRectangleHeightCount * this.hexRectangleHeight) + (sideLengthCount * this.sideLength))) / 2;

        if (this.hasAttribute("grid")) this.redrawGrid();
        this.trueOffsetTop = this.canvas.offsetTop;
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
        const nextMousePos = this.hasAttribute("nextmousepos")
            ? JSON.parse(this.getAttribute("nextmousepos"))
            : null;

        this.canvas.style.backgroundColor = this.tileColor;
        this.canvas.style.border = "2px solid white";

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let filling = this.tileColor;

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

                let overImage;
                if (
                    nextMousePos &&
                    nextMousePos.y == i &&
                    nextMousePos.x == j
                ) {
                    if (image === this.merdeImg) {
                        overImage = this.footprintImgRed;
                    } else {
                        overImage = this.footprintImg;
                    }
                }

                this.drawHexagon(j, i, filling, image, overImage);
            }
        }
    }

    drawHexagon(x, y, filling, underImg, overImg) {
        const rowWidth = y % 2 == 0 ? BOARD_WIDTH : BOARD_WIDTH - 1;
        const isInverted = this.isInverted();
        if (isInverted) x = rowWidth - 1 - x;

        const xStart = y % 2 === 0 ? 0 : this.hexRadius;
        const newX = x * this.hexRectangleWidth + xStart + this.offsetX;
        const newY = y * (this.sideLength + this.hexHeight) + this.offsetY;

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
            underImg === this.donkeyImg
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

        const drawImg = (img) => {
            this.ctx.drawImage(
                img,
                newX,
                newY,
                this.hexRectangleWidth,
                this.hexRectangleHeight,
            );
        };

        if (underImg) drawImg(underImg);

        if (overImg) drawImg(overImg);
    }
}

customElements.define("game-grid", GameGrid);
