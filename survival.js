/***
 * @DONE:
 * Make player (circle)
 * Make randomly generated ref points
 * Make camera follow player around
 * Make ref points into trees
 * Make player face cursor
 * Nice WASD flow
 * Show stats on where you are and angle
 * Add map you can see at bottom left
 * Add toggle map with "m" key
 * 5 slot inventory (although 10 slots displayed on screen
 * @TODO:
 * Add comments on current code
 * Make collide function
 * Make other inanimate objects
 * Other features that we need to add...
***/

/**
 * Key - (index of array is its id, deprecated id array)
 * 0 = wood
 * 1 = berry (WIP)
 * 2 = stone (WIP)
 * 3 = crafting box (WIP)
 *
 * */

//@GLOBAL VARIABLES
{
var Player;
var inventory;
var cam;
var mapsize = 4000;
var togglemap = false;
var keys = [];
var generator = new Random(1);
textFont(createFont("Candara"), 15);
}
//@MAP GENERATION
{
var xoff = round(random(0, 4000));
var sum = 0;    
var grid = [];
for (var x = 0; x < 100; x ++) {
    var yoff = xoff;
    for(var y = 0; y < 100; y ++) {
        noStroke();
        var bright = map(noise(xoff, yoff), 0, 1, 0, 255);
        grid[x*100 + y] = bright;
        yoff += 0.02;
        sum += bright;
    }
    xoff += 0.02;
}
var avg = sum/10000;
var stdev = 0;
for(var i = 0; i < grid.length; i++) {
    stdev += Math.pow(abs(grid[i] - avg), 2);
}
stdev /= 10000;
stdev = Math.sqrt(stdev);
}
//@KEY INTERACTION
{
keyPressed = function(){
    keys[keyCode]=true;
    if(keys[77]) {
        togglemap = !togglemap;
    }
    
    for (var i = 48; i <= 52; i++){
        if (keys[i]){
            inventory.selected = i - 48;
        }
    }
};
keyReleased = function(){ keys[keyCode]=false; };
}

//@CAMERA
{
/***
 * Basic camera function: A function to have a “camera” follow
 * the player’s field of view.
 * @param x the x-position of the camera
 * @param y the y-position of the camera
 * @func view translate field of view to the camera
***/
var Camera = function(x, y) {
    // Variables about where the camera is
    this.x=x; this.y=y; this.w=width; this.h=height;
    /***
      * Basic view function: Moves the screen to focus on the object plyer
      * by translation. Will not move past the edge of map (0,0) upper left to 
      * (4000, 4000) lower right.
      * @param plyer an object that the camera is following which has x and y
    ***/
    this.view = function(plyer){
        this.x=plyer.x;
        this.y=plyer.y;
        
        this.x = constrain(this.x,this.w/2 - 100,mapsize-this.w/2 + 100);
        this.y = constrain(this.y,this.h/2 - 100,mapsize-this.h/2 + 100);
        translate(width/2-this.x,height/2-this.y);
    };
};
}
//@VIEW
{
/***
 * Simple function to find if the object is in view of the camera.
 * @param obj the object that is to be analysed
***/
var view = function(obj){
    return obj.x+width/2-cam.x<width&&obj.x+width/2-cam.x>-obj.r&&
    obj.y+height/2-cam.y<height&&obj.y+height/2-cam.y>-obj.r;
};
}
//@COLLIDE
{
//Radial based collide function
var collide = function(obj1, obj2) {
    return dist(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.r/2 + obj2.r/2;
};
}

//@WOOD
var Wood = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
 Wood.prototype.draw = function() {
    noStroke();
    pushMatrix();
    translate(-83, 208);
    rotate(-45);
    fill(110, 53, 53);
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this      .size*2);
    ellipse(this.x, this.y+15, this.size-1     , this.size-5);
    stroke(110, 53, 53);
    fill(247, 195, 111);
    ellipse(this.x, this.y-15, this.size-1     , this.size-5);
    popMatrix();
};

//@BERRIES
var Berries = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
 Berries.prototype.draw = function() {
    stroke(0, 10, 130);
    fill(0, 45, 255);
    ellipse(this.x, this.y, this.size,        this.size);
    ellipse(this.x+10, this.y+5, this.size     , this.size);
    ellipse(this.x-3, this.y+11, this.size     , this.size);
    noStroke();
    fill(15, 10, 168);
    ellipse(this.x-3, this.y-5, this.size     -11, this.size-11);
    ellipse(this.x+15, this.y+2, this.size     -11, this.size-11);
    ellipse(this.x-8, this.y+10, this.size     -11, this.size-11);
};


//The actual inventory
var obj_count = [0, 0, 0, 0, 0];
var obj_type = [];


/** Lynette's Inventory*/
var Inventory = function(x, y) {
    this.x = x;
    this.y = y;
    this.selected = 0;
    this.draw = function() {
        stroke(100, 100, 100);
        fill(200, 200, 200);
        rectMode(CENTER);
        rect(this.x, this.y, 315, 65);
        var pos = 0;
        for(var i = 380; i < 650; i += 60) {
            fill(130, 130, 130);
            if (pos !== this.selected) {
                stroke(100,100,100);
                strokeWeight(1);
            } else {
                stroke(15,15,15);
                strokeWeight(3);
            }
            rect(i, this.y, 50, 50);
            pos++;
            rect(i, 550, 50, 50);
        }
        strokeWeight(1);
        
        var inc = 0;
        for (var i = 0; i < obj_count.length; i++) {
            if (obj_count[i] > 0) {
                fill(255, 255, 255);
                switch (i) {
                    case 0:
                        var wood = new Wood(87, 570, 16);
                        wood.draw();
                        break;
                    case 1:
                        var berries = new Berries(380 + 60 * inc, 546, 18);
                        berries.draw();
                        break;
                    default:
                    
                        break;
                }
            
                fill(255, 255, 255);
                textSize(25);
                text(obj_count[i], 377 + 60 * inc, 565);
            
                inc++;
            }
        }
    };
};
inventory = new Inventory(500, 550, 0);

//@RECIPE
var recipe = function(counts, desc, outpt, booleans) {
    this.counts = counts;
    this.desc = desc;
    this.color = color(counts[0]*255/32, counts[1]*255/8, counts[2]*255/32);
    /***
     * Before I forget:
     * outpt[0] = number of items
     * outpt[1] = item type
     * outpt[2] = any food?
     * outpt[3] = any health?
    ***/
    this.outpt = outpt;
    /***
     * Before I forget:
     * booleans[0] = need fire?
     * booleans[1] = need crafting?
    ***/
    this.booleans = booleans;
    this.isPossible = function() {
        for(var i = 0; i < obj_count.length; i++) {
            if(obj_count[i] < counts[i]) {
                return false;
            }
        }
        //@TODO: IMPLEMENT CRAFTING AND FIRE DETECTION
        return true;
    };
    this.drawapply = function(x, y) {
        if(mouseX > x && mouseY > y && mouseX < x + 40 && mouseY < y + 40) {
            stroke(this.color);
            fill(this.color, 50);
            rect(x, y, 200, 40, 3);
            fill(0);
            text(this.desc, x + 10, y + 27);
            if(mouseReleased()) {
                for(var i = 0; i < obj_count.length; i++) {
                    obj_count[i] -= counts[i];
                }
                obj_count[outpt[1]] += outpt[0];
                
            }
        }
        else {
            stroke(this.color);
            fill(this.color, 50);
            rect(x, y, 40, 40, 3);
        }
    };
};

var recipes = [];
recipes.add = function(counts, desc) {
    recipes.push(new recipe(counts, desc));
};
recipes.apply = function(counts) {
    var x1 = 20;
    var y1 = 60;
    for(var i = 0; i < recipes.length; i++) {
        if(recipes[i].isPossible()) {
            recipes[i].drawapply(x1, y1);
            y1 += 50;
        }
    }
};

//Trees
var tree = function(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.leaves = random(3, 5.5);
    this.draw = function() {
        noStroke();
        fill(11, 120, 18, 100);
        ellipse(this.x, this.y, this.r*this.leaves, this.r*this.leaves);
        fill(92, 46, 4);
        ellipse(this.x, this.y, this.r, this.r);
    };
    this.harvest = function()  {
        this.r -= (40/(floor(this.leaves)));
    };
};
var trees = [];
trees.add = function(x, y) {
    trees.push(new tree(x, y));
};
trees.apply = function() {
    for(var i = 0; i < trees.length; i++) {
        trees[i].draw();
         if (trees[i].r <= 0) {
            trees.splice(i, 1);
        }
    }
};

//@STONES
var stone = function(x, y) {
    this.x = x;
    this.y = y;
    this.r = 70;
    this.draw = function() {
        noStroke();
        fill(100,100,100);
        ellipse(this.x, this.y, this.r, this.r);
    };
    this.harvest = function()  {
        this.r -= 2;
    };
};
var stones = [];
stones.add = function(x, y) {
    stones.push(new stone(x, y));
};
stones.apply = function() {
    for(var i = 0; i < stones.length; i++) {
        stones[i].draw();
        if (stones[i].r <= 0) {
            stones.splice(i, 1);
        }
    }
};

var bush = function(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.berries = [[this.x+8, this.y-4], [this.x-23, this.y+1],[this.x-11, this.y-17], [this.x-1, this.y+10]];
    this.randomBerries = function() {
        var randomLength = floor(random(0, 4));

if (randomLength > 0) {
for(var i = 0; i < randomLength; i++){
  this.berries.splice(floor(random(0, 1)*this.berries.length), 1);
}
}
    };
    this.draw = function() {
        if(view(this)) { 
            noStroke();
            fill(19, 145, 21);
             if (this.berries.length !== 0){
            ellipse(this.x, this.y, this.r, this.r);
            ellipse(this.x-20, this.y, this.r*(4/5), this.r*0.8);
            ellipse(this.x-9, this.y-15, this.r*0.7, this.r*0.7);
            
            for (var i = 0; i < this.berries.length; i++){
               fill(247, 15, 15);
               ellipse(this.berries[i][0], this.berries[i][1], this.r/5, this.r/5);
            }
             }
        }
    };
    this.harvest = function()  {
        this.berries.splice(floor(random(0,1)*this.berries.length), 1);
       
    };
};
var bushes = [];
bushes.add = function(x, y) {
    bushes.push(new bush(x, y));
    
};

    
bushes.apply = function() {
    for(var i = 0; i < bushes.length; i++) {
        bushes[i].draw();
    }
};

var player = function(x, y) {
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.r = 20;
    this.health = 100;
    this.food = 100;
    this.dir = atan2(this.y - mouseY, mouseX - this.x);
    this.speedLimit = 3;
    this.bars = function() {
        rectMode(LEFT);
        strokeWeight(1);
        fill(250, 13, 13, 100);
        rect(342, 482, 210, 12);
        fill(250, 13, 13);
        rect(342, 482, this.health*2.1, 12);
        fill(230, 145, 10, 100);
        rect(342, 500, 210, 12);
        fill(230, 145, 10);
        rect(342, 500, this.food*2.1, 12);
    };
    this.draw = function() {
        noStroke();
        fill(255, 224, 157);
        pushMatrix();
        translate(this.x, this.y);
        rotate(this.dir);
        ellipse(0, 0, this.r, this.r);
        rect(0, 6, this.r, 5, 2);
        popMatrix();
        fill(0);
    };
    this.update = function() {
        if(keys[UP] || keys[87]) {
            this.yspeed -= 0.1;
            
        }
        if (keys[DOWN] || keys[83]) {
            this.yspeed += 0.1;
        }
        if(keys[LEFT] || keys[65]){
            this.xspeed -= 0.1;
        }
        if(keys[RIGHT] || keys[68]) {
            this.xspeed += 0.1;
        }
        this.x += this.xspeed;
        this.applyCollision(trees, this.xspeed, 0);
        this.y += this.yspeed;
        this.applyCollision(trees, 0, this.yspeed);
        this.x = constrain(this.x, this.r/2, mapsize - this.r/2);
        this.y = constrain(this.y, this.r/2, mapsize - this.r/2);
        this.xspeed *= 0.9;
        this.yspeed *= 0.9;
        this.dir = atan2(mouseY - height/2, mouseX - width/2);
        this.xspeed = constrain(this.xspeed, -1*this.speedLimit, this.speedLimit);
        this.yspeed = constrain(this.yspeed, -1*this.speedLimit, this.speedLimit);
       /* this.x += cos(this.dir)*this.speed;
        this.y += sin(this.dir)*this.speed;*/
        
        /*if (keys[UP] || keys[87]) {
            screeny += pagil;
            pr = 90;
    }
    if (keys[DOWN] || keys[83]) {
        screeny -= pagil;
        pr = 90;
    }*/
    };
    this.stats = function() {
        
        textSize(15);
        fill(0);
        text("Location: (" + round(this.x*100)/100 + ", " + round(this.y*100)/100 + ")", 20, 20);
        text("Facing: " + round((((-1*Math.sign(this.dir)+1)/2)*360 + this.dir)*100)/100 + " degrees from East", 20, 35);
    };
    this.collectTree = function(tree){
        return abs(this.x - tree.x)*2 < (tree.r*tree.leaves) && abs(this.y - tree.y)*2 < (tree.r*tree.leaves);
    };
    this.collectBush = function(bush){
        return abs(this.x - bush.x)*2 < (bush.r * 1.5) && abs(this.y - bush.y)*2 < (bush.r * 1.5);
    };
    this.collectStone = function(stone){
        return abs(this.x - stone.x)*2 < (stone.r * 1.5) && abs(this.y - stone.y)*2 < (stone.r * 1.5);
    };
    this.applyCollision=function(obj,velx,vely){
        for(var i=0; i<obj.length; i++){
            if(collide(this,obj[i])){ // handle collisions
                if(vely>0){ this.yvel=0; this.y=obj[i].y-this.r; }
                if(vely<0){ this.yvel=0; this.y=obj[i].y+obj[i].r; }
                if(velx<0){ this.xvel=0; this.x=obj[i].x+obj[i].r; }
                if(velx>0){ this.xvel=0; this.x=obj[i].x-this.r; }
            }
        }
    };
};
Player = new player(2000, 2000);
cam = new Camera(Player.x, Player.y);

mouseClicked = function() {
    for (var i = 0; i < trees.length; i++) {
        if (Player.collectTree(trees[i]) === true && obj_count[0] < 64) {
            trees[i].harvest();
            obj_count[0]++;
        }
    }
    for (var i = 0; i < bushes.length; i++) {
        if (Player.collectBush(bushes[i]) === true && bushes[i].berries.length > 0  && obj_count[1] < 64) {
            bushes[i].harvest();
            obj_count[1]++;
        }
    }
    for (var i = 0; i < stones.length; i++) {
        if (Player.collectStone(stones[i]) === true && obj_count[2] < 64) {
            stones[i].harvest();
            obj_count[2]++;
        }
    }
};

for(var i = 0; i < 450; i++) {
    var x = random(0, 4000);
    var y = random(0, 4000);
    var position = round(x/40)*100 + round(y/40);
    var num = generator.nextGaussian();
    while(grid[position] < num*stdev + avg){
        x = random(0, 4000);
        y = random(0, 4000);
        position = round(x/40)*100 + round(y/40);
    }
    trees.add(x, y);  
}
        

for(var i = 0; i < 150; i++) {
    var a = random(0, 4000);
    var b = random(0, 4000);
    var position = round(a/40)*100 + round(b/40);
    var num = generator.nextGaussian();
    while(grid[position] > stdev*num + avg){
        a = random(0, 4000);
        b = random(0, 4000);
        position = round(a/40)*100 + round(b/40);
    }
    bushes.add(a,b);
}

for (var i = 0; i < bushes.length; i++){
    bushes[i].randomBerries();
}

for(var i = 0; i < 100; i++) {
    var a = random(0, 4000);
    var b = random(0, 4000);
    
    stones.add(a,b);
}



recipes.add([30, 0, 5, 0, 0], "fire");
recipes.add([20, 0, 10, 0, 0], "crafting box");
recipes.add([0, 3, 0, 0, 0], "wine");
var scene = 0;
var draw = function() {
    if(scene === 0) {
        if(!togglemap) {
            background(120, 180, 94);
            rectMode(CORNER);
            pushMatrix();
            cam.view(Player);
            stroke(255, 0, 0);
            line(0, 0, mapsize, 0);
            line(0, 0, 0, mapsize);
            line(mapsize, 0, mapsize, mapsize);
            line(0, mapsize, mapsize, mapsize);
            bushes.apply();
            Player.draw();
            trees.apply();
            stones.apply();
            Player.update();
            popMatrix();
            Player.stats();
            rectMode(CENTER);
            inventory.draw();
            rectMode(CORNER);
            recipes.apply();
            rectMode(CENTER);
            Player.bars();
        }
        if(togglemap) {
            background(120, 180, 94);
            rectMode(CORNER);
            pushMatrix();
            cam.view(Player);
            stroke(255, 0, 0);
            line(0, 0, mapsize, 0);
            line(0, 0, 0, mapsize);
            line(mapsize, 0, mapsize, mapsize);
            line(0, mapsize, mapsize, mapsize);
            bushes.apply();
            Player.draw();
            trees.apply();
            stones.apply();
            popMatrix();
            Player.stats();
            rectMode(CENTER);
            inventory.draw();
            rectMode(CORNER);
            recipes.apply();
            for(var i = 0; i < 100; i++) {
                for(var j = 0; j < 100; j++) {
                    noStroke();
                    fill(150 - round(grid[i*100 + j]/10)*10, round(grid[i*100 + j]/10)*10, 0);
                    rect(i*4, j*4, 4, 4);
                }
            }
            for(var i = 0; i < bushes.length; i++) {
                stroke(255, 0, 0);
                strokeWeight(2);
                point(bushes[i].x/10, bushes[i].y/10);
            }
            for(var j = 0; j < trees.length; j++) {
                stroke(0, 255, 0);
                point(trees[j].x/10, trees[j].y/10);
            }
            for(var j = 0; j < stones.length; j++) {
                stroke(255, 255, 255);
                point(stones[j].x/10, stones[j].y/10);
            }
            pushMatrix();
            fill(0, 0, 0);
            noStroke();
            translate(Player.x/10, Player.y/10);
            rotate(Player.dir + 90);
            triangle(0, -5, -3, 5, 3, 5);
            popMatrix();
            rectMode(CENTER);
            Player.bars();
        }
    }
};
