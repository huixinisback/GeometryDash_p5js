let ground, coins, water;

function setup() {
  new Canvas(800, 400);
  
  ground = new Group();
  ground.tile = 'g';
  ground.w = 30;
  ground.h = 30;
  ground.collider = 'rect';
  ground.color = 'green';

  coins = new Group();
  coins.tile = 'c';
  coins.d = 24; // circle diameter
  coins.collider = 'circle';
  coins.color = 'gold';

  water = new Group();
  water.tile = 'w';
  water.w = 30;
  water.h = 30;
  water.collider = 'polygon';
  water.color = 'blue';

  new Tiles([
    'cc',
    'gg                                     g',
    ' ',
    '   gg',
    '       c                        c  g',
    '      ggg    c                  g',
    '            ggg             g                 ccc',
    '                                              ccc',
    '     c c c       c c                          ccc',
    'gggggggggggwwwwwggggg  ggggggggggg            ggg'
  ], 0, 0, 34, 34);
}

function draw(){
    
}