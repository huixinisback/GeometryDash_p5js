//player box
let box;
// game variables
let startGame = false;
let mapUsed;
let startCoordinates = [];
let jumpChance = 2;
let gameOver = false;
let endTimer = 0;
let level = 1;
let lastlevel = 2;
let lost = true;

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

//sound assets
let backgroundTrack;
let failSound;
let passSound;

//load assets before the code runs
function preload(){
    bg = loadImage('assets/geobg.png');
    cube = loadImage('assets/cube.png');
    cube2 = loadImage('assets/cube2.png');
    startGameImg = loadImage('assets/startgame.png');
    endGameImg = loadImage('assets/clear!.png')
    spike = loadImage('assets/spike.png');
    menu = loadImage('assets/menu.png')
    menubgImg = loadImage('assets/menubg.png')
    tileMap1 = loadStrings('stages/tiles1.txt');
    tileMap2 = loadStrings('stages/tiles2.txt');
    backgroundTrack = createAudio('assets/stereo-madness.mp3');
    failSound = createAudio('assets/geometry-dash-death-sound.mp3');
    passSound = createAudio('assets/game-start.mp3');
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
    ground.collider = 'static'; // will collide with other sprites, and stay in programmed coordinates, will not move when collided 
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

    new Tiles(tileMap1, 0, 0, 50, 50);     
    mapUsed = tileMap1;

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
        backgroundTrack.play();
        box.vel.x = 8; // start moving the box at "2m/s"
  
        // Camera follow once box crosses screen center
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

        for (let tile of ground) {
            if (box.colliding(tile)) {
                if (abs(tile.x - box.x) > 100) continue; // skip far tiles
                //declaring safe zone
                let leftEdge = tile.x - tile.w / 2;
                let leftEdgeHeight = tile.y - tile.h / 2;
                // if not safe zone touched, reset game
                if (box.x < leftEdge && box.y > leftEdgeHeight) {
                    lost = true;
                    resetGame();
                }
            }
        }
        
         // if sharp objects touched, reset game
        if (box.collides(sharp)){
            startGame = false;
            lost = true;
            resetGame();
        }
        
        // successful clear sequence if end is reached
        if (box.collides(finishline)){
            lost = false;
            triggerGameOver();
        }

        // game over sequence
        if (gameOver) {
            // Wait for 2 seconds (120 frames)
            if (frameCount - endTimer > 120) {
                endImg.visible = false; // hide the 'clear!' image
                //reset the game and variables
                startGame = false;
                gameOver = false;
                resetGame();
                // increase the level and load new map
                level += 1;
                loadLevel();
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

        if (box.colliding(ground) && box.vel.x >= 0.5) {
            box.rotation = 0; // make sure the box is upright
            let particle = new Sprite(box.x, box.y + box.h / 2, 8, 8, 'none');
            particle.color = 'white';
            particle.strokeWeight = 0;
            particle.vel.x = -5;
            particle.vel.y = random(-2, 0);
            particle.life = 30;
            particles.add(particle);
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
    if(lost){
        backgroundTrack.stop();
        failSound.play();
    }

    particles.removeAll();
    startGame = false;
    // stop box movement
    box.vel.y = 0;
    box.vel.x = 0;
    box.rotation = 0;
    // put the box back to the starting position
    box.x = startCoordinates[0]; 
    box.y = startCoordinates[1];
    jumpChance = 2; // reset jump chance
    // reset camera view
    camera.x = width / 2; // default camera ce  nter
    // show hiddent orbs
    for (let orb of orbs) {
        orb.visible = true;
        orb.collider = 'static'
    }
}
  
function triggerGameOver() {
    backgroundTrack.stop();
    passSound.play();
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
        mapUsed = tileMap1;
	} else if (level === 2) {
		new Tiles(tileMap2, 0, 0, 50, 50);
        mapUsed = tileMap2;
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
