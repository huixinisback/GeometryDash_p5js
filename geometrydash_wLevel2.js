let box;
let floor;
let startGame = false;
let startCoordinates = [];
let jumpChance = 2;
let gameOver = false;
let endTimer = 0;

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
    box.color = 'black'; // we'll draw it manually
    box.stroke = 'white';       // no default border
    box.img = cube;
    startCoordinates = [50,height/2]

    ground = new Group();
    ground.tile = 'g';
    ground.w = 50;
    ground.h = 50;
    ground.collider = 'static';
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
    sharp.collider = 'static'; // use 'static' or 'none' for immobile triangle hazards

    finishline = new Group();
    finishline.tile ='f' ;
    finishline.w = 50;
    finishline.h = 1200;
    finishline.visible = false;
    finishline.collider = 'static';

    new Tiles(tileMap, 0, 0, 50, 50);     
    startImg = new Sprite( (width/2), height/2, 190, 90);
    startImg.img = startGameImg;
    startImg.collider = 'static';
}

function draw() {
    drawGradientBackground();
    
    // Start game on click
    if (!startGame && mouse.presses()) {
      startGame = true;
      startImg.visible = false;
    }else if(!startGame){
        if ((frameCount % 60) < 60 / 2) {
            startImg.visible = true;  // ON for 30 frames
        } else {
            startImg.visible = false; // OFF for 30 frames
        } 
    }
  
    // Move box if game started
    if (startGame) {
      box.vel.x = 2;
  
        // Follow camera once box crosses screen center
        if (box.x >= width / 2) {
            camera.x = box.x;
            
        } else {
            camera.x = 400; // keep camera fixed initially
            
        }

        for (let orb of orbs) {
            if (box.colliding(orb)) {
                orb.visible = false;
                orb.collider = 'none'
                jumpChance = 4;

            }
        }

        for (let tile of ground) {
            if (box.colliding(tile)) {
                let leftEdge = tile.x - tile.w / 2;
                let leftEdgeHeight = tile.y - tile.h / 2;
                if (box.x < leftEdge && box.y > leftEdgeHeight) {
                    resetGame();
                }
            }
        }
        
        if (box.collides(sharp)){
            startGame = false;
            resetGame();
        }
        

        if (box.collides(finishline)){
            triggerGameOver();
        }

        if (gameOver) {
            // Wait for 3 seconds (180 frames)
            if (frameCount - endTimer > 120) {
                endImg.visible = false;
                resetGame();
                startGame = false;
                gameOver = false;
            }
            console.log("FrameCount")
            console.log(frameCount)
            console.log("EndTimer")
            console.log(endTimer)
        }
        

        if (kb.presses('space')||mouse.presses()&& jumpChance > 0){
            box.vel.y = -5;
            box.rotation +=20
            box.rotationSpeed = 1;
            jumpChance-=1;
        }

        if(box.collides(ground) && jumpChance < 2){
            jumpChance = 2;
        }
      
    }

  }
/* Using Canvas API, part of the browser*/
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
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];
    box.vel.y = 0;
    box.rotation = 0;
    camera.x = box.x + 350

    for (let orb of orbs) {
        orb.visible = true;
        orb.collider = 'static'
        jumpChance = 4;
    }
}
  
function triggerGameOver() {
	if (!gameOver) {
		gameOver = true;
		endTimer = frameCount;

		endImg = new Sprite(box.x, height / 2, 126, 24);
		endImg.collider = 'static';
		endImg.img = endGameImg;
	}
}
