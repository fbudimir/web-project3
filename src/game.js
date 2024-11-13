// boje i stil su uzeti iz originalne arkadne igre Breakout

// dobavi canvas html element i 2d context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800; // fiksirana sirina
canvas.height = window.innerHeight; // cijela duzina ekrana

// varijable palice
const paddleWidth = 100;
const paddleHeight = 20;
let paddle = {
	x: canvas.width / 2 - paddleWidth / 2,
	y: canvas.height - 30,
	width: paddleWidth,
	height: paddleHeight,
	color: "red",
	speed: 10, // brzina pomicaja palice
	dx: 0, // promjena u x osi, na pocetku 0
};
// varijable loptice
let ball = {
	x: canvas.width / 2,
	y: canvas.height - 40,
	radius: 6,
	dx: Math.random() < 0.5 ? -6 : 6, // nasumican pocetni smjer
	dy: -6,
	color: "white",
};

// varijable za cigle
const brickRowNum = 8;
const brickColumnNum = 14;
const brickWidth = 53;
const brickHeight = 20;
const brickPadding = 4;
const brickOffsetTop = 100;
const brickOffsetLeft = 3;
let bricks = []; // bricks array

// score i ostalo
let currentScore = 0;
let highestScore = localStorage.getItem("highestScore") || 0;
let gameOver = false;

// inicijaliziraj bricks array
function initBricks() {
	bricks = [];
	for (let c = 0; c < brickColumnNum; c++) {
		bricks[c] = [];
		for (let r = 0; r < brickRowNum; r++) {
			bricks[c][r] = { x: 0, y: 0, status: 1 };
		}
	}
}

// resetiraj potrebne varijable i pokreni opet igru
function resetGame() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height - 40;
	ball.dx = 6;
	ball.dy = -6;
	paddle.x = canvas.width / 2 - paddleWidth / 2;
	currentScore = 0;
	gameOver = false;
	initBricks(); // ponovo inicijaliziraj cigle
	updateGame(); // pokreni opet loop igre
}

// fja zaduzena za crtanje palice
function drawPaddle() {
	// gornji svjetliji dio palice
	ctx.fillStyle = "#ff6666";
	ctx.fillRect(paddle.x, paddle.y, paddle.width, 3);

	// donji tamniji dio palice
	ctx.fillStyle = "#b30000";
	ctx.fillRect(paddle.x, paddle.y + paddle.height - 3, paddle.width, 3);

	// glavna boja
	ctx.fillStyle = paddle.color;
	ctx.fillRect(paddle.x, paddle.y + 3, paddle.width, paddle.height - 6);
}

// fja zaduzena za crtanje loptice (kvadrata)
function drawBall() {
	ctx.beginPath();
	ctx.fillStyle = ball.color;
	ctx.fillRect(
		// u pocetku radio s lopticom pa ima radius, plus lakse je za racunat kolizije
		ball.x - ball.radius,
		ball.y - ball.radius,
		ball.radius * 2,
		ball.radius * 2
	);
	ctx.closePath();
}

// fja zaduzena za crtanje cigli
function drawBricks() {
	for (let c = 0; c < brickColumnNum; c++) {
		for (let r = 0; r < brickRowNum; r++) {
			let b = bricks[c][r];
			if (b.status == 1) {
				const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
				const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
				b.x = brickX;
				b.y = brickY;

				// boja ovisna o retku
				let mainColor;
				if (r < 2) {
					mainColor = "red";
					lighterColor = "#ff6666"; // svjetlija crvena
					darkerColor = "#b30000"; // tamnija crvena
				} else if (r < 4) {
					mainColor = "orange";
					lighterColor = "#ffcc66"; // svjetlija narancasta
					darkerColor = "#cc8400"; // tamnija narancasta
				} else if (r < 6) {
					mainColor = "yellow";
					lighterColor = "#ffff99"; // svjetlija zuta
					darkerColor = "#cccc00"; // tamnija zuta
				} else {
					mainColor = "green";
					lighterColor = "#66bd66"; // lighter green55a155
					darkerColor = "#006600"; // darker green
				}

				// gornji svjetliji dio
				ctx.fillStyle = lighterColor;
				ctx.fillRect(brickX, brickY, brickWidth, 4);

				// donji tamniji dio
				ctx.fillStyle = darkerColor;
				ctx.fillRect(brickX, brickY + brickHeight - 4, brickWidth, 4);

				// glavni dio
				ctx.fillStyle = mainColor;
				ctx.fillRect(brickX, brickY + 4, brickWidth, brickHeight - 8);
			}
		}
	}
}

// fja zaduzena za crtanje bodova i high-scorea na gornje-desnom kutu ekrana
function drawScore() {
	ctx.fillStyle = "white";
	ctx.font = "16px 'Press Start 2P', Arial";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";

	ctx.fillText("Score: " + currentScore, canvas.width - 20, 20);
	ctx.fillText("High Score: " + highestScore, canvas.width - 20, 50);
}

// fja zaduzena za crtanje Game Over teksta ukoliko je igrac izgubio
function drawGameOver() {
	ctx.fillStyle = "red";
	ctx.font = "48px 'Press Start 2P', Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
	ctx.font = "16px 'Press Start 2P', Arial";
	ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 50);
}

// fja zaduzena za crtanje "You Won" teksta ukoliko je igrac pobjedio
function drawYouWon() {
	ctx.fillStyle = "white";
	ctx.font = "48px 'Press Start 2P', Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("YOU WON!", canvas.width / 2, canvas.height / 2);
	ctx.font = "16px 'Press Start 2P', Arial";
	ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 50);
}

// glavni game loop, poziva se svakim frame-om, na pocetku igre i kada se klikne mis za restart nakon gubitka/pobjede igraca
function updateGame() {
	if (gameOver) {
		drawGameOver();
		return;
	}

	// uvjet pobjede
	// alternativa je provjeravat velicinu bricks array-a
	if (brickColumnNum * brickRowNum <= currentScore) {
		drawYouWon();
		gameOver = true;
		return;
	}

	movePaddle();

	// pomicanje kuglice
	ball.x += ball.dx;
	ball.y += ball.dy;

	// normaliziraj brzinu loptice
	// bez ovoga bi loptica putovala brze po dijagonali za faktor korijena od 2
	let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
	const desiredSpeed = 7;
	ball.dx = (ball.dx / speed) * desiredSpeed;
	ball.dy = (ball.dy / speed) * desiredSpeed;

	// provjera kolizije loptice s zidovima lijevo i desno
	if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
		ball.dx = -ball.dx;
	}

	// provjera kolizije sa donjim zidom, uvjet za gubitak igre
	if (ball.y + ball.radius >= canvas.height) {
		gameOver = true;
		if (currentScore > highestScore) {
			highestScore = currentScore;
			localStorage.setItem("highestScore", highestScore);
		}
	}

	// provjera kolizije sa gornjim zidom
	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
	}

	// provjera kolizije s palicom
	if (
		ball.x + ball.radius >= paddle.x &&
		ball.x - ball.radius <= paddle.x + paddle.width &&
		ball.y + ball.radius >= paddle.y
	) {
		// omjer udaljenosti loptice od centra palice i duljine centra palice
		let hitPosition =
			(ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

		// podesiti kut odbijanja loptice po tom omjeru
		ball.dx = hitPosition * 8;

		// smjer loptice naravno prema gore
		ball.dy = -Math.abs(ball.dy);
	}

	// provjera kolizije s ciglama
	for (let c = 0; c < brickColumnNum; c++) {
		for (let r = 0; r < brickRowNum; r++) {
			let b = bricks[c][r];
			if (b.status == 1) {
				if (
					// provjera je li loptica (kvadrat) imalo UNUTAR cigle
					ball.x + ball.radius >= b.x &&
					ball.x - ball.radius <= b.x + brickWidth &&
					ball.y + ball.radius >= b.y &&
					ball.y - ball.radius <= b.y + brickHeight
				) {
					// provjera s koje strane cigle je udarila loptica
					// x i y koordinate objekata su gornji lijevi kutevi
					// usporedjuje se centar kuglice (kvadrata) i zida cigle, npr. ukoliko je centar kuglice iznad gornjeg dijela cigle, A LOPTICA JE UNUTAR CIGLE, znaci da je odbijanje nastalo od gore
					let collisionFromLeft = ball.x <= b.x;
					let collisionFromRight = ball.x >= b.x + brickWidth;
					let collisionFromTop = ball.y <= b.y;
					let collisionFromBottom = ball.y >= b.y + brickHeight;

					// promjeni smjer kretanja na temelju strane odbijanja
					// moguce je da se loptica odbije od kuta, u kojem slucaju bi se promijenio i x i y smjer kretanja
					if (collisionFromBottom) {
						ball.dy = Math.abs(ball.dy);
					} else if (collisionFromTop) {
						ball.dy = -Math.abs(ball.dy);
					}
					if (collisionFromLeft) {
						ball.dx = -Math.abs(ball.dx);
					} else if (collisionFromRight) {
						ball.dx = Math.abs(ball.dx);
					}

					// oznaci ciglu kao mrtvu i povecaj score
					b.status = 0;
					currentScore++;
				}
			}
		}
	}

	// ocisti i crtaj sve za novi frame
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBricks();
	drawBall();
	drawPaddle();
	drawScore();

	requestAnimationFrame(updateGame);
}

// lijeva i desna strelica tipkovnice
let leftPressed = false;
let rightPressed = false;

// event listeneri
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// pocetno inicijaliziranje cigli i inicijalno pozivanje glavnog game loop-a
initBricks();
updateGame();

// fja koje provjeravaju koji gumb je spusten/dignut
function keyDownHandler(e) {
	if (e.key === "ArrowLeft") {
		leftPressed = true;
	} else if (e.key === "ArrowRight") {
		rightPressed = true;
	}
	updatePaddleDirection();
}
function keyUpHandler(e) {
	if (e.key === "ArrowLeft") {
		leftPressed = false;
	} else if (e.key === "ArrowRight") {
		rightPressed = false;
	}
	updatePaddleDirection();
}

// fja za determiniranje smjera pomicaja palice ukoliko je gumb pritisnut
function updatePaddleDirection() {
	if (leftPressed && !rightPressed) {
		// zbog cudnog ponasanja kod pritiskanja oba gumba
		paddle.dx = -paddle.speed;
	} else if (rightPressed && !leftPressed) {
		paddle.dx = paddle.speed;
	} else {
		paddle.dx = 0;
	}
}

// fja zaduzena za pomicanje palice ukoliko je diferencijal paddle.dx != 0
function movePaddle() {
	paddle.x += paddle.dx;

	if (paddle.x < 0) {
		paddle.x = 0;
	} else if (paddle.x + paddle.width > canvas.width) {
		paddle.x = canvas.width - paddle.width;
	}
}

// klik na canvas restartira igru ako je igra zavrsila
canvas.addEventListener("click", function () {
	if (gameOver) {
		resetGame();
	}
});
