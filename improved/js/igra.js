let canvas, context, frameTimer;
let kvadrat = {
    w: 25,
    h: 25
};
let snake = {
    x: 0,
    y: 0,
    rep: [],
    smer: null,
    length: 1,
    lengthIncrease: 1,
} 
let jabuk = {
    x: 0,
    y: 0
}
let blue = {
    x: 0,
    y: 0
}
let shit = {
    x: 0,
    y: 0
}
let game = {
    tickCounter: 0,
    ticksPerGameTick: 10,
    score: 0,
    isPoweredUp: false,
    powerTimeLeft: 0,
    isEnd: false,
    canChangeInput: true,
    bufferedInput: null
}
let board = {
    edge: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    border: {
        x: 0,
        y: 0
    }
}

window.main = function() {
    // Zacetek programa
    // Najdemo canvas in si ga shranimo v globalno spremenljivko
    context = canvas.getContext("2d");

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousemove", handleMouseMove);
    showMenu = document.getElementById("menu");
    showBlackBox = document.getElementById("BlackBox");
    showRestart = document.getElementById("restart");

    // Dinamicen rob zaslona
    window.init(canvas);

    randomPlayerSpawn();
    randomJabukSpawn();
    randomBlueSpawn()
    randomShitSpawn();
    tick();
}

window.init = function(_canvas) {
    canvas = _canvas;
    board.edge.x = canvas.width - canvas.width % kvadrat.w;
    board.border.x = (canvas.width - board.edge.x);
    board.offset.x = board.border.x/2;

    board.edge.y = canvas.height - canvas.height % kvadrat.h;
    board.border.y = (canvas.height - board.edge.y);
    board.offset.y = board.border.y/2;

    correctOutOfBounds(jabuk, true);
    correctOutOfBounds(blue, true);
    correctOutOfBounds(shit, true);
}

/**
 * Assigns a random set of coordinates to the Snake
 */
function randomPlayerSpawn() {
    let coords = getRandomCoordinates();
    snake.x = coords.x;
    snake.y = coords.y;
}

/**
 * Assigns a random set of coordinates to Jabuk
 */
function randomJabukSpawn() {
    let coords = getRandomCoordinates();
    jabuk.x = coords.x;
    jabuk.y = coords.y;
}

/**
 * Assigns a random set of coordinates to Shit
 */
function randomShitSpawn() {
    let coords = getRandomCoordinates();
    shit.x = coords.x;
    shit.y = coords.y;
}

/**
 * Assigns a random set of coordinates to Blue
 */
function randomBlueSpawn() {
    let coords = getRandomCoordinates();
    blue.x = coords.x;
    blue.y = coords.y;
}

function correctOutOfBounds(objectToCorrect, randomise) {
    let randomCoords = getRandomCoordinates();
    if(objectToCorrect.x < 0){
        if (randomise) objectToCorrect.x = randomCoords.x;
        else objectToCorrect.x = canvas.width - board.border.x - kvadrat.w;
    }
    if(objectToCorrect.x > canvas.width - board.border.x - kvadrat.w){
        if (randomise) objectToCorrect.x = randomCoords.x;
        else objectToCorrect.x = 0;
    }
    if(objectToCorrect.y < 0){
        if (randomise) objectToCorrect.y = randomCoords.y;
        else objectToCorrect.y = canvas.height - board.border.y - kvadrat.h;
    }
    if(objectToCorrect.y > canvas.height - board.border.y - kvadrat.h){
        if (randomise) objectToCorrect.y = randomCoords.y;
        else objectToCorrect.y = 0;
    }
}

/**
 * Returns an object with two number values, an x and y coordinate
 * @returns {{x: number, y: number}}
 */
function getRandomCoordinates() {
    return {
        x: Math.floor(Math.random() * (canvas.width / kvadrat.w - 1)) * kvadrat.w,
        y: Math.floor(Math.random() * (canvas.height / kvadrat.h - 1)) * kvadrat.h
    }
}

function handleKeyDown(event) {

    if (!game.canChangeInput) {
        game.bufferedInput = event.key;
        return;
    }

    game.bufferedInput = null;

    console.log("Tipka", event.key);
    if(event.key === "ArrowRight" && snake.smer !== "left"){
        snake.smer = "right";
        game.canChangeInput = false;
    }
    else if(event.key === "ArrowLeft" && snake.smer !== "right"){
        snake.smer = "left";
        game.canChangeInput = false;
    }
    else if(event.key === "ArrowUp" && snake.smer !== "down"){
        snake.smer = "up";
        game.canChangeInput = false;
    }
    else if(event.key === "ArrowDown" && snake.smer !== "up"){
        snake.smer = "down";
        game.canChangeInput = false;
    }
    // Ko pritisnes escape, ustavi animacijo in prikaze meni
    if(event.key === "Escape"){
        if(frameTimer){
            cancelAnimationFrame(frameTimer);
            frameTimer = null;
            showMenu.style.display = "block";
            for(let i = 0; i < 100000; i++){
                if(i % 1000 === 0){
                    showBlackBox.style.opacity = i * 0.00001;
                }
            }
            showBlackBox.style.display = "block";
        }
        else{
            tick();
            showMenu.style.display = "none";
            showBlackBox.style.opacity = 0
            //showBlackBox.style.display = "none";
        }
    }
}
function handleMouseMove(e) {
    // Miska se je premaknila
}

/**
 * Game tick function that ticks multiple times a second. Every tick new game-state is calculated and then drawn again
 */
function tick() {
    if(game.isEnd){
        return;
    }

    if (game.tickCounter > game.ticksPerGameTick) {
        game.canChangeInput = true;
        update();
        draw();
        if (game.bufferedInput !== null) {
            handleKeyDown({key: game.bufferedInput});
        }
        game.tickCounter = 0;
    }
    game.tickCounter++;

    frameTimer = requestAnimationFrame(tick);
}

/**
 * Function for updating the game-state. Calculates new positions, checks for collision with power-ups
 * and respawns them, if necessary
 */
function update() {
    // Premikanje kvadrata
    // Dodaja nove elemente v array rep, z prejsnjimi koordinatami kvadrata
    if(game.isPoweredUp === true && game.powerTimeLeft > 0){
        snake.lengthIncrease = 2;
        game.powerTimeLeft--;
    }
    else if(game.isPoweredUp === true && game.powerTimeLeft <= 0){
        snake.lengthIncrease = 1;
        game.isPoweredUp = false;
    }

    snake.rep.push({x: snake.x, y: snake.y})
    if(snake.length < snake.rep.length){
        snake.rep.shift()
    }

    if(snake.smer === "right"){
        snake.x += kvadrat.w;
    }
    if(snake.smer === "left"){
        snake.x -= kvadrat.w;
    }
    if(snake.smer === "up"){
        snake.y -= kvadrat.h;
    }
    if(snake.smer === "down"){
        snake.y += kvadrat.h;
    }
    // Collision detection
    correctOutOfBounds(snake, false);

    // Preveri, ce je koordinata igralca enaka jabuku
    if(snake.x === jabuk.x && snake.y === jabuk.y){
        snake.length += snake.lengthIncrease
        game.score += 100 * snake.lengthIncrease
        randomJabukSpawn();
        if(snake.length % 3 === 0 && game.ticksPerGameTick > 0){
            game.ticksPerGameTick -= 1
        }
    }

    // Preveri, ce je koordinata igralca enaka blue
    if(snake.x === blue.x && snake.y === blue.y){
        game.score += 200;
        randomBlueSpawn()
        game.isPoweredUp = true;
        game.powerTimeLeft += 50;
    }

    // Preveri, ce je koordinata igralca enaka shitu
    if(snake.x === shit.x && snake.y === shit.y){
        game.score -= 150
        randomShitSpawn();
        game.ticksPerGameTick += 1
    }

    // Preveri, ce je koordinata igralca enaka kateremu elementu iz repa (death condition)
    for(let i = 0; i < snake.rep.length -2; i++){
        if(snake.rep[i].x === snake.x && snake.rep[i].y === snake.y){
            cancelAnimationFrame(frameTimer);
            frameTimer = null
            for(let i = 0; i < 100000; i++){
                if(i % 1000 === 0){
                    showBlackBox.style.opacity = i * 0.00001
                }
            }
            showBlackBox.style.display = "block";
            showRestart.style.display = "block";
            game.isEnd = true
        }
    }


}

function draw() {
    // Risanje sprogramirajte tukaj

    // Narisemo ozadje
    context.fillStyle = "white";
    context.fillRect(0,0,canvas.width,canvas.height);

    // Narisemo kvadrat (igralec)
    context.beginPath();
    context.fillStyle = "33cc33";
    context.fillRect(snake.x + board.offset.x ,snake.y + board.offset.y, kvadrat.w, kvadrat.h);

    // Narisemo rep (za kvadratom)
    for(let i = 0; i < snake.rep.length; i++){
        context.beginPath();
        context.fillStyle = "#009933";
        context.fillRect(snake.rep[i].x + board.offset.x, snake.rep[i].y + board.offset.y, kvadrat.w, kvadrat.h);
    }

    // Narisemo jabuk
    context.beginPath();
    context.fillStyle = "red";
    context.fillRect(jabuk.x + board.offset.x, jabuk.y + board.offset.y, kvadrat.w, kvadrat.h);


    // Narisemo shit
    context.beginPath();
    context.fillStyle = "brown";
    context.fillRect(shit.x + board.offset.x, shit.y + board.offset.y, kvadrat.w, kvadrat.h);

    // Narisemo blue
    context.beginPath();
    context.fillStyle = "blue";
    context.fillRect(blue.x + board.offset.x, blue.y + board.offset.y, kvadrat.w, kvadrat.h);




    // Narisemo mrezo (v glavnem za debugging)
    for(let i = 0; i < canvas.width/25; i++){
        if(i === 0){
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = board.border.x;
            context.moveTo(0, 0);
            context.lineTo(0, canvas.height);
            context.stroke();
        }
        else if(i > 0 && i + 1 < canvas.width/25){
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = 1;
            context.moveTo(i*25 + board.offset.x, 0);
            context.lineTo(i*25 + board.offset.x, canvas.height);
            context.stroke();
        }
        else{
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = board.border.x;
            context.moveTo(canvas.width, 0);
            context.lineTo(canvas.width, canvas.height);
            context.stroke();
        }
    }
    for(let i = 0; i < canvas.height/25; i++){
        if(i === 0){
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = board.border.y;
            context.moveTo(0, 0);
            context.lineTo(canvas.width, 0);
            context.stroke();
        }
        else if(i > 0 && i + 1 < canvas.height/25){
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = 1;
            context.moveTo(0, i*25 + board.offset.y);
            context.lineTo(canvas.width, i*25 + board.offset.y);
            context.stroke();
        }
        else{
            context.beginPath();
            context.fillStyle = "black";
            context.lineWidth = board.border.y;
            context.moveTo(0, canvas.height);
            context.lineTo(canvas.width, canvas.height);
            context.stroke();
        }
        // Narisemo score
        context.font = "30px Corbel";
        context.fillStyle = "#336600";
        context.fillText("Score: " + game.score, 70, 40);}
}

function reload() {
    // Ponovno nalozi stran
    location.reload();
}