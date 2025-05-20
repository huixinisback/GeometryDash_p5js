    //player box
    let box;
    // game variables
    let startGame = false;
    //asset names
    let cube;
    let spike;
    let tileMap;

    // world building groups
    let ground;
    let orbs;
    let sharp;
    let finishline;
    let particles;

    //load assets before the code runs
    function preload(){
        cube = loadImage('assets/cube.png');
        spike = loadImage('assets/spike.png');
        tileMap1 =  tileMap = loadStrings('stages/tiles1.txt');    
    }

    function setup() {
        new Canvas(800, 600);
        world.gravity.y = 15;

        box = new Sprite(50, height / 2, 50, 50);
        box.img = cube;
        box.friction = 0;
        box.bounciness = 0;
    
        strokeWeight(5);
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
    }

    function draw() {
        background("blue");

        // Start game on click
        if (!startGame && mouse.pressed()) {
        startGame = true; // start game function
        }
        
        if (startGame) { //start game functions
        box.vel.x = 5; // start moving the box at "2m/s"
    
            // camera follow once box crosses screen center
            if (box.x >= width / 2) {
                camera.x = box.x; // camera tracking for the player sprite
            } else {
                camera.x = 400; // keep camera fixed initially
            }

            if (kb.pressed('space')||mouse.pressed()){
                box.vel.y = -8; // upwards push
                box.rotateTo(359, 10); // 1 full turn
            }
        
            // Use this once when the cube lands
            if (box.colliding(ground) && box.vel.x >= 2) {
                box.rotation = 0; // make sure the box is upright
                let particle = new Sprite(box.x, box.y + box.h / 2, 8, 8, 'none');
                particle.color = 'white';
                particle.strokeWeight = 0;
                particle.vel.x = -6;
                particle.vel.y = random(-2, 0);
                particle.life = 30;
                particles.add(particle);
            }
        }
        
    }
    