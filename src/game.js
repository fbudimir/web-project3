// boje i stil su uzeti iz originalne arkadne igre Breakout

// dobavi canvas html element i 2d context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// cijela duzina i sirina ekrana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// varijable palice
const paddleWidth = 150;
const paddleHeight = 20;
let paddle = {
	x: canvas.width / 2 - paddleWidth / 2,
	y: canvas.height - 30,
	width: paddleWidth,
	height: paddleHeight,
	color: "red",
	speed: 10, // brzina pomicaja palice
	dx: 0, // diferencijal promjene u x osi, na pocetku 0, za ovoliko se palica pomice svakim novim frame-om
};
// varijable loptice
let ball = {
	x: canvas.width / 2,
	y: canvas.height - 40,
	radius: 6,
	dx: Math.random() < 0.5 ? -6 : 6, // nasumican pocetni smjer
	dy: -6, // vertikalni diferencijal pomaka, za ovoliko se loptica pomice svakim novim frame-om
	color: "white",
};

// varijable za cigle
const brickWidth = 64;
const brickHeight = 20;
const brickPadding = 4;
const brickOffsetTop = 100;

// izracunava koliko stupaca cigli stane u canvas
const brickColumnNum = Math.floor(canvas.width / (brickWidth + brickPadding));
const brickRowNum = 8;

// izracunava koliko prostora zauzimaju cigle u jednom retku (i padding izmedju njih)
const brickWidthTotal =
	brickColumnNum * brickWidth + (brickColumnNum - 1) * brickPadding;

// ostatak prostora podijeli na dva i to je offset lijeve i desne strane tako da cigle budu centrirane
const brickOffsetLeft = (canvas.width - brickWidthTotal) / 2;

let bricks = []; // bricks array

// score i ostalo
let currentScore = 0;
let highestScore = localStorage.getItem("highestScore") || 0;
let gameOver = false;
let easyMode = false; // ukoliko je true, prikazuje YOU WIN tekst, postavlja se na true pritiskom "e"

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
	easyMode = false;
	initBricks(); // ponovo inicijaliziraj cigle
	updateGame(); // pokreni opet loop igre
}

// fja zaduzena za crtanje palice
function drawPaddle() {
	// gornji svjetliji dio palice
	// fillRect kreira Rectangle
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
// u pocetku je bilo radjeno s okruglom lopticom pa ima radius, plus lakse je za racunat kolizije jer je x i y u centru objekta
function drawBall() {
	ctx.fillStyle = ball.color;
	ctx.fillRect(
		ball.x - ball.radius,
		ball.y - ball.radius,
		ball.radius * 2,
		ball.radius * 2
	);
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

	ctx.fillText(
		"Score: " + currentScore + " / " + brickColumnNum * brickRowNum,
		canvas.width - 20,
		20
	);
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
	if (brickColumnNum * brickRowNum <= currentScore || easyMode) {
		drawYouWon();
		gameOver = true;
		return;
	}

	// pomakni palicu ukoliko je postavljen diferencijal za pomak
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
				// provjera je li loptica (kvadrat) imalo UNUTAR cigle
				if (
					ball.x + ball.radius > b.x &&
					ball.x - ball.radius < b.x + brickWidth &&
					ball.y + ball.radius > b.y &&
					ball.y - ball.radius < b.y + brickHeight
				) {
					// provjera s koje strane cigle je udarila loptica
					// x i y koordinate cigle su gornji lijevi kutevi, od loptice je centar
					// usporedjuje se centar loptice (kvadrata) i zida cigle, npr. ukoliko je centar kuglice U PROSLOM FRAME-U bio iznad gornjeg dijela cigle, A LOPTICA JE TRENUTNO UNUTAR CIGLE, znaci da je odbijanje nastalo od gore
					let prevBallX = ball.x - ball.dx;
					let prevBallY = ball.y - ball.dy;

					let collisionFromLeft = prevBallX <= b.x;
					let collisionFromRight = prevBallX >= b.x + brickWidth;
					let collisionFromTop = prevBallY <= b.y;
					let collisionFromBottom = prevBallY >= b.y + brickHeight;

					// stari nacin, nije se gledao prijasnji frame nego trenutni, desavalo bi se da jedan frame ne uhvati centar loptice kao unutar cigle sto ponekad dovodi do prolazenja kroz cigle
					// 				let collisionFromLeft = ball.x <= b.x;
					// 				let collisionFromRight = ball.x >= b.x + brickWidth;
					// 				let collisionFromTop = ball.y <= b.y;
					// 				let collisionFromBottom = ball.y >= b.y + brickHeight;

					// promjeni smjer kretanja na temelju strane odbijanja
					if (collisionFromBottom) {
						ball.dy = Math.abs(ball.dy);
					} else if (collisionFromTop) {
						ball.dy = -Math.abs(ball.dy);
					} else if (collisionFromLeft) {
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

	// ocisti canvas i crtaj sve potrebno za novi frame
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBricks();
	drawBall();
	drawPaddle();
	drawScore();

	// poziva novi frame
	requestAnimationFrame(updateGame);
}

// event listeneri za tipke i klikove
let leftPressed = false;
let rightPressed = false;
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
canvas.addEventListener("click", function () {
	// klik na canvas restartira igru ako je igra zavrsila
	if (gameOver) {
		resetGame();
	}
});

// pocetno inicijaliziranje cigli i inicijalno pozivanje glavnog game loop-a
initBricks();
updateGame();

// fje koje provjeravaju koji gumb je spusten/dignut
function keyDownHandler(e) {
	if (e.key === "ArrowLeft") {
		leftPressed = true;
		updatePaddleDirection();
	} else if (e.key === "ArrowRight") {
		rightPressed = true;
		updatePaddleDirection();
	} else if (e.key === "e") {
		easyMode = true;
	}
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
