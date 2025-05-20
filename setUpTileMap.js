
//asset names
let spike;
let tileMap;

// world building groups
let ground;
let orbs;
let sharp;
let finishline;

//load assets before the code runs
function preload(){
    spike = loadImage('assets/spike.png');
    tileMap1 =  tileMap = loadStrings('stages/tiles1.txt');    
}

function setup() {
    new Canvas(800, 600);
    world.gravity.y = 10;
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

    new Tiles(tileMap, 0, 0, 50, 50);     
}

function draw() {
    background("purple");
    camera.x +=3;
}
 