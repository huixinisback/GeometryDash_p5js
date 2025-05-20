//player box
let box;
// game variables
let startGame = false;
let mapUsed;
let jumpChance = 2;
let startCoordinates = [];
let gameOver = false;
let endTimer = 0;


//asset names
let cube;
let spike;
let tileMap;
let bg;
let startGameImg;
let endGameImg;

// world building groups
let ground;
let orbs;
let sharp;
let finishline;
let particles; 

//load assets before the code runs
function preload(){
    bg = loadImage('assets/geobg.png');
    cube = loadImage('assets/cube.png');
    spike = loadImage('assets/spike.png');
    startGameImg = loadImage('assets/startgame.png');
    endGameImg = loadImage('assets/clear!.png')
    tileMap1 =  tileMap = loadStrings('stages/tiles1.txt');       
}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height / 2, 50, 50);
    box.img = cube;
    box.friction = 0;
    box.bounciness = 0;
    startCoordinates = [50,height/2]; // where the sprite should start from each game

    ground = new Group();
    ground.tile = 'g';
    ground.w = 50;
    ground.h = 50;
    ground.collider = 'static';// will collide with other sprites, and stay in programmed coordinates, will not move when collided 
    ground.color = 'black';
    ground.stroke = 'rgba(0,0,0,0)';

    orbs = new Group();
    orbs.tile = 'o';
    orbs.d = 24;
    orbs.collider = 'static';
    orbs.color = 'white';
    orbs.strokeWeight = 0;

    sharp = new Group();
    sharp.tile = 's';
    sharp.h =25;
    sharp.w = 25;
    sharp.img = spike;
    sharp.collider = 'static'; 

    finishline = new Group();
    finishline.tile ='f' ;
    finishline.w = 50;
    finishline.h = 1200; // really tall so that the player sprite will not pass it
    finishline.visible = false;
    finishline.collider = 'static';

    particles = new Group();

    new Tiles(tileMap, 0, 0, 50, 50);     
    mapUsed = tileMap;

    startImg = new Sprite( (width/2), height/2, 190, 90);
    startImg.img = startGameImg;
    startImg.collider = 'none'; // like a static sprite but cannot collide with other sprites

    frameRate(60);
}

function draw() {
    
    drawBackground();

    // Start game on click
    if (!startGame && mouse.presses()) {
      startGame = true; // start game function
      startImg.visible = false; // hide the imagery
    }else if(!startGame){
        // if game has not started, imagery prompt to start game
        if ((frameCount % 60) < 60 / 2) {
            startImg.visible = true;  // ON for 30 frames
        } else {
            startImg.visible = false; // OFF for 30 frames
        } 
    }
    
    if (startGame) { //start game functions
        box.vel.x = 8; // start moving the box at "2m/s"

        // camera follow once box crosses screen center
        if (box.x >= width / 2) {
            camera.x = box.x; // camera tracking for the player sprite
        } else {
            camera.x = 400; // keep camera fixed initially
        }

        for (let orb of orbs) {
            if (box.colliding(orb)) {
                // hide the orb as a "collected" effect
                orb.visible = false;
                orb.collider = 'none';
                // boost/bonus from orb
                box.vel.y = -5;
                jumpChance = 2;
            }
        }

        if ((kb.presses('space')||mouse.presses())&& jumpChance > 0 && !gameOver){
            box.vel.y = -10; // upwards push
            box.rotateTo(359, 15); // 1 full turn
            jumpChance-=1; // decrease jump, prevent multiple jumps in the air
        }

        // reset jump chance when they land 
        if(box.collides(ground) && jumpChance < 2){
            jumpChance = 2;
        }

        for (let tile of ground) {
            if (box.colliding(tile)) {
                if (abs(tile.x - box.x) > 100) continue; // skip far tiles
                //declaring safe zone
                let leftEdge = tile.x - tile.w / 2;
                let leftEdgeHeight = tile.y - tile.h / 2;
                // if not safe zone touched, reset game
                if (box.x < leftEdge && box.y > leftEdgeHeight) {
                    resetGame();
                }
            }
        }
        
         // if sharp objects touched, reset game
        if (box.collides(sharp)){
            startGame = false;
            resetGame();
        }
        
        // successful clear sequence if end is reached
        if (box.collides(finishline)){
            triggerGameOver();
        }
    
        // Use this once when the cube lands
        if (box.colliding(ground) && box.vel.x >= 0.5) {
            box.rotation = 0; // make sure the box is upright
            let particle = new Sprite(box.x, box.y + box.h / 2, 8, 8, 'none');
            particle.color = 'white';
            particle.strokeWeight = 0;
            particle.vel.x = -6;
            particle.vel.y = random(-2, 0);
            particle.life = 30;
            particles.add(particle);
        }

         // game over sequence
        if (gameOver) {
            // Wait for 3 seconds (180 frames)
            if (frameCount - endTimer > 180) {
                endImg.visible = false; // hide the 'clear!' image
                //reset the game and variables
                resetGame();
                startGame = false;
                gameOver = false;
            }
        }
    }
}

// tint black and white image
// changing back ground colour
function drawBackground() {
    let lastRow = mapUsed[mapUsed.length - 1];
    let numCols = lastRow.length;
    let totalJourney = numCols * 50;
    let progress = map(box.x, 0, totalJourney, -100, 0);
    c1 = color('#9933ff'); // Purple
    c2 = color('#4169e1'); // Blue
    // Create a looping value from 0 to 1 and back 
    let amt = (sin(frameCount * 0.5) + 1) / 2;
    // Get the interpolated color
    let blend = lerpColor(c1, c2, amt); // p5.js function to blend color
    // Apply tint and draw background
    tint(blend);
    image(bg, progress, 0, 800, 600); // Draw the tinted background image
    noTint(); //  prevents tint from affecting other images
}   

function resetGame() {
    particles.removeAll();
    startGame = false;
    // stop box movement
    box.rotateTo(0, 0); 
    box.vel.y = 0;
    box.vel.x = 0;
    box.rotation = 0;
    // put the box back to the starting position
    box.x = startCoordinates[0]; 
    box.y = startCoordinates[1];
    jumpChance = 2; // reset jump chance
    // reset camera view
    camera.x = width / 2; // default camera center
    // show hiddent orbs
    for (let orb of orbs) {
        orb.visible = true;
        orb.collider = 'static'
    }
}

function triggerGameOver() {
	if (!gameOver) {
        // stop box movement
        box.vel.x = 0;
        jumpChance = 0;
		gameOver = true; // update game over status
        endTimer = frameCount; // keep track of the current time
        // show game over image
		endImg = new Sprite(box.x, height / 2, 126, 24);
		endImg.collider = 'static';
		endImg.img = endGameImg;
	}
}