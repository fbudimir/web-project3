// Get the canvas element and the 2D context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Paddle settings
const paddleWidth = 100;
const paddleHeight = 20;
let paddle = {
	x: canvas.width / 2 - paddleWidth / 2,
	y: canvas.height - 30,
	width: paddleWidth,
	height: paddleHeight,
	color: "red",
};

// Ball settings
let ball = {
	x: canvas.width / 2,
	y: canvas.height - 40,
	radius: 10,
	dx: 5,
	dy: -5,
	color: "white",
};

// Brick settings
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];

// Fill the bricks array
for (let c = 0; c < brickColumnCount; c++) {
	bricks[c] = [];
	for (let r = 0; r < brickRowCount; r++) {
		bricks[c][r] = { x: 0, y: 0, status: 1 };
	}
}

// Score settings
let currentScore = 0;
let highestScore = localStorage.getItem("highestScore") || 0;

// Draw paddle
function drawPaddle() {
	ctx.fillStyle = paddle.color;
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = ball.color;
	ctx.fill();
	ctx.closePath();
}

// Draw bricks
function drawBricks() {
	for (let c = 0; c < brickColumnCount; c++) {
		for (let r = 0; r < brickRowCount; r++) {
			if (bricks[c][r].status == 1) {
				const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
				const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
				bricks[c][r].x = brickX;
				bricks[c][r].y = brickY;
				ctx.fillStyle = "blue";
				ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
			}
		}
	}
}

// Draw score
function drawScore() {
	ctx.fillStyle = "white";
	ctx.font = "24px Arial";
	ctx.fillText("Score: " + currentScore, 20, 30);
	ctx.fillText("High Score: " + highestScore, canvas.width - 200, 30);
}

// Update game logic
function updateGame() {
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Ball collision with walls
	if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
		ball.dx = -ball.dx;
	}

	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
	} else if (ball.y + ball.radius > canvas.height) {
		if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
			ball.dy = -ball.dy;

			if (currentScore > highestScore) {
				highestScore = currentScore;
				localStorage.setItem("highestScore", highestScore);
			}
		} else {
			alert("GAME OVER");
			document.location.reload();
		}
	}

	// Ball collision with bricks
	for (let c = 0; c < brickColumnCount; c++) {
		for (let r = 0; r < brickRowCount; r++) {
			let b = bricks[c][r];
			if (b.status == 1) {
				if (
					ball.x > b.x &&
					ball.x < b.x + brickWidth &&
					ball.y > b.y &&
					ball.y < b.y + brickHeight
				) {
					ball.dy = -ball.dy;
					b.status = 0;
					currentScore++;
				}
			}
		}
	}

	// Draw everything
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBricks();
	drawBall();
	drawPaddle();
	drawScore();

	requestAnimationFrame(updateGame);
}

// Event listener for paddle movement
document.addEventListener("keydown", function (e) {
	if (e.key == "ArrowLeft" && paddle.x > 0) {
		paddle.x -= 20;
	} else if (e.key == "ArrowRight" && paddle.x < canvas.width - paddle.width) {
		paddle.x += 20;
	}
});

// Initialize the game
updateGame();
