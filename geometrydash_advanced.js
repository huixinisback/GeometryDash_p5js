//player box
let box;
// game variables
let startGame = false;
let startCoordinates = [];
let jumpChance = 2;
let gameOver = false;
let endTimer = 0;
let level = 1;
let lastlevel = 2;

//asset names
let cube;
let startGameImg;
let endGameImg;
let spike;
let tileMap;
let tileMap1;
let bg;

// world building groups
let ground;
let orbs;
let sharp;
let finishline;

//image sprites, sprites that holds images to be displayed
let startImg;
let endImg;

//menu
let menuOpen = false;
let menubg;
let choice1;
let choice2;

//load assets before the code runs
function preload(){
    bg = loadImage('assets/geobg.png')
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
    box.img = cube;
    startCoordinates = [50,height/2]; // where the sprite should start from each game

    ground = new Group();
    ground.tile = 'g';
    ground.w = 50;
    ground.h = 50;
    ground.collider = 'static'; // will collide with other sprites, and stay in programmed coordinates, will not move when collided 
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

    new Tiles(tileMap1, 0, 0, 50, 50);     

    startImg = new Sprite( (width/2), height/2, 190, 90);
    startImg.img = startGameImg;
    startImg.collider = 'none'; // like a static sprite but cannot collide with other sprites
    
    // menu button
    menuImg = new Sprite(50,20,92,29);
    menuImg.img = menu;
    menuImg.collider = 'static'; // static so that it collides with the player mouse and stays in place
    //menu selection page
    menubg = new Sprite (width/2, height/2, 240, 140, 'static');
    menubg.img = menubgImg;
    choice1 = new Sprite (width/2-50,height/2, 50, 50, 'static');
    choice2 = new Sprite (width/2+50,height/2, 50, 50, 'static');
    choice1.img = cube;
    choice2.img = cube2;
    // close the menu we just made.
    closeMenu();

}

function draw() {
    drawBackground();
    // Differentiate the different clicks 
    if (!startGame && (mouse.presses()||kb.presses('space'))) {
        if (menuImg.mouse.hovering()  && menuImg.visible === true) {
            menuOpen = true; // update status for menu
            openMenu(); // open the menu view
        }else if (menuOpen === false){
            startGame = true; // start game function
            startImg.visible = false; // hide the start game imagery
            menuImg.visible = false; // hide the menu button imagery
        }

        choiceSelect(); // update the menu choice
    }else if(!startGame){
        // if game has not started, imagery prompt to start game
        if ((frameCount % 60) < 60 / 2) {
            startImg.visible = true;  // ON for 30 frames
        } else {
            startImg.visible = false; // OFF for 30 frames
        } 

        menuImg.visible = true; // menu button visible
    }
  
    if (startGame) { // start game functions
      box.vel.x = 2; // start moving the box at "2m/s"
  
        // Camera follow once box crosses screen center
        if (box.x >= width / 2) {
            camera.x = box.x; // camera tracking for the player sprite
            
        } else {
            camera.x = 400; // keep camera fixed initially
            
        }

        for (let orb of orbs) {
            if (box.colliding(orb)) {
                // hide the orb as a "collected" effect
                orb.visible = false;;
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
            startGame = false;
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
                // increase the level and load new map
                level += 1;
                loadLevel();
            }
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

  // tint black and white image
  // changing back ground colour
function drawBackground() {
    c1 = color('#9933ff'); // Purple
    c2 = color('#4169e1'); // Blue
    // Create a looping value from 0 to 1 and back (triangle wave)
    let amt = (sin(frameCount * 0.5) + 1) / 2;
    // Get the interpolated color
    let blend = lerpColor(c1, c2, amt); // p5.js function to blend color
    // Apply tint and draw background
    tint(blend);
    image(bg, 0, 0, width, height); // Draw the tinted background image
    noTint(); //  prevents tint from affecting other images
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

function loadLevel() {
	// Clear old tiles
	ground.removeAll();
	sharp.removeAll();
	orbs.removeAll();
	finishline.removeAll();
    // if last level reached, restart
    if (lastlevel < level) {level = 1}; 
	// Load tile map for each level
	if (level === 1) {
		new Tiles(tileMap1, 0, 0, 50, 50);
	} else if (level === 2) {
		new Tiles(tileMap2, 0, 0, 50, 50);
	}
}

// show menu items
function openMenu(){
    menubg.visible = true;
    choice1.visible = true;
    choice2.visible = true;
    menubg.collider = 'static';
    choice1.collider = 'static'
    choice2.collider = 'static';   
}

// hide menu items
function closeMenu(){
    menuOpen = false;
    menubg.visible = false;
    choice1.visible = false;
    choice2.visible = false;
    menubg.collider = 'none';
    choice1.collider = 'none';
    choice2.collider = 'none';
}

// update player skin based on choice
function choiceSelect() {
	if (menuOpen) {
		let clicked = world.getSpriteAt(mouse); // get the clicked sprite
		// based on the sprite that is clicked.
        if (clicked == choice1) {
			box.img = cube;
			closeMenu();
		} else if (clicked == choice2) {
			box.img = cube2;
			closeMenu();
		}
	}
}
