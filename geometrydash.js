//player box
let box;
// game variables
let startGame = false;
let startCoordinates = [];
let jumpChance = 2;
let gameOver = false;
let endTimer = 0;

//asset names
let cube;
let startGameImg;
let endGameImg;
let spike;
let tileMap;
let tileMap1;

// world building groups
let ground;
let orbs;
let sharp;
let finishline;

//image sprites, sprites that holds images to be displayed
let startImg;
let endImg;

//load assets before the code runs
function preload(){
    cube = loadImage('assets/cube.png');
    startGameImg = loadImage('assets/startgame.png');
    endGameImg = loadImage('assets/clear!.png')
    spike = loadImage('assets/spike.png');
    tileMap1 =  tileMap = loadStrings('stages/tiles1.txt');    
    
}

function setup() {
    new Canvas(800, 600);
    world.gravity.y = 10;

    box = new Sprite(50, height / 2, 50, 50);
    box.img = cube;
    startCoordinates = [50,height/2]; // where the sprite should start from each game

    ground = new Group();
    ground.tile = 'g';
    ground.w = 50;
    ground.h = 50;
    ground.collider = 'static';// will collide with other sprites, and stay in programmed coordinates, will not move when collided 
    ground.color = 'black';
    ground.stroke = 'white'
    
    orbs = new Group();
    orbs.tile = 'o';
    orbs.d = 24;
    orbs.collider = 'static';
    orbs.color = 'white';
    
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

    new Tiles(tileMap, 0, 0, 50, 50);     
    startImg = new Sprite( (width/2), height/2, 190, 90);
    startImg.img = startGameImg;
    startImg.collider = 'none'; // like a static sprite but cannot collide with other sprites
}

function draw() {
    drawGradientBackground();
    
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
      box.vel.x = 2; // start moving the box at "2m/s"
  
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
                orb.collider = 'none'; // make sure the player will not interact with this.
                // boost/bonus from orb
                jumpChance = 4;
            }
        }

        for (let tile of ground) {
            if (box.colliding(tile)) {
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
            resetGame();
        }
        
        // successful clear sequence if end is reached
        if (box.collides(finishline)){
            triggerGameOver();
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
            // Normal Javascript method
            // setTimeout(() => {
            //     endImg.visible = false;
            //     resetGame();
            //     startGame = false;
            //     gameOver = false;
            // }, 2000);
        }
        
        if (kb.presses('space')||mouse.presses()&& jumpChance > 0){
            box.vel.y = -5; // upwards push
            box.rotation +=20 // rotational angle
            box.rotationSpeed = 1; 
            jumpChance-=1; // decrease jump, prevent multiple jumps in the air
        }

        // reset jump chance when they land 
        if(box.collides(ground) && jumpChance < 2){
            jumpChance = 2;
        }
      
    }

  }
/* Using Canvas API, part of the browser*/
//ALternative to using a background image
function drawGradientBackground() {
    let ctx = drawingContext;
    let gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#000');  // top color
    gradient.addColorStop(1, '#9933ff');  // bottom color
  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}   

function resetGame() {
    startGame = false;
    // put the box back to the starting position
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];
    // stop box movement
    box.vel.y = 0;
    box.rotation = 0;
    jumpChance = 2; // reset jump chance
    // reset camera view
    camera.x = box.x + 350
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
