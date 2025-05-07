let box;
let floor;
let startGame = false;
let startCoordinates = [];
let jumpChance = 2;
let gameOver = false;
let endTimer = 0;
let level = 1;
let menuOpen = false;
let menubg;
let choice1;
let choice2;

function preload(){
    cube = loadImage('assets/cube.png');
    cube2 = loadImage('assets/cube2.png');
    startGameImg = loadImage('assets/startgame.png');
    endGameImg = loadImage('assets/clear!.png')
    spike = loadImage('assets/spike.png');
    menu = loadImage('assets/menu.png')
    menubgImg = loadImage('assets/menubg.png')
    tileMap1 = loadStrings('stages/tiles1.txt');
    tileMap2 = loadStrings('stages/tiles2.txt');
    
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

    new Tiles(tileMap1, 0, 0, 50, 50);     

    startImg = new Sprite( (width/2), height/2, 190, 90);
    startImg.img = startGameImg;
    startImg.collider = 'none';
    // menu
    menuImg = new Sprite(50,20,92,29);
    menuImg.img = menu;
    menuImg.collider = 'static';

    menubg = new Sprite (width/2, height/2, 240, 140, 'static');
    menubg.img = menubgImg;
    choice1 = new Sprite (width/2-50,height/2, 50, 50, 'static');
    choice2 = new Sprite (width/2+50,height/2, 50, 50, 'static');
    choice1.img = cube;
    choice2.img = cube2;

    closeMenu();

}

function draw() {
    drawGradientBackground();
    
    // Start game on click
    if (!startGame && (mouse.presses()||kb.presses('space'))) {
        if (menuImg.mouse.hovering()  && menuImg.visible === true) {
            menuOpen = true;
            openMenu();
        }else if (menuOpen === false){
            startGame = true;
            startImg.visible = false;
            menuImg.visible = false;
        }
         choiceSelect();
      
    }else if(!startGame){
        if ((frameCount % 60) < 60 / 2) {
            startImg.visible = true;  // ON for 30 frames
        } else {
            startImg.visible = false; // OFF for 30 frames
        } 

        menuImg.visible = true;
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
            if (frameCount - endTimer > 180) {
                endImg.visible = false;
                resetGame();
                startGame = false;
                gameOver = false;
                level += 1;
                loadLevel(level);
            }
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

function loadLevel(level) {
	// Clear old tiles
	ground.removeAll();
	sharp.removeAll();
	orbs.removeAll();
	finishline.removeAll();
    lastlevel = 2;
    if (lastlevel < level) {level = 1};

	// Load tile map
	if (level === 1) {
		new Tiles(tileMap1, 0, 0, 50, 50);
	} else if (level === 2) {
		new Tiles(tileMap2, 0, 0, 50, 50);
	}
}

function openMenu(){
    menubg.visible = true;
    choice1.visible = true;
    choice2.visible = true;
    menubg.collider = 'static';
    choice1.collider = 'static'
    choice2.collider = 'static';   
}

function closeMenu(){
    menuOpen = false;
    menubg.visible = false;
    choice1.visible = false;
    choice2.visible = false;
    menubg.collider = 'none';
    choice1.collider = 'none';
    choice2.collider = 'none';
}

function choiceSelect() {
	if (menuOpen) {
		let clicked = world.getSpriteAt(mouse);
		if (clicked == choice1) {
			box.img = cube;
			closeMenu();
		} else if (clicked == choice2) {
			box.img = cube2;
			closeMenu();
		}
	}
}
