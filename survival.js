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
var cam;
var mapsize = 4000;
var keys = [];
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
}

//@KEY INTERACTION
keyPressed = function(){keys[keyCode]=true;};
keyReleased = function(){ keys[keyCode]=false; };

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

/***
 * Simple function to find if the object is in view of the camera.
 * @param obj the object that is to be analysed
***/
var view = function(obj){
    return obj.x+width/2-cam.x<width&&obj.x+width/2-cam.x>-obj.r&&
    obj.y+height/2-cam.y<height&&obj.y+height/2-cam.y>-obj.r;
};

//Radial based collide function
var collide = function(obj1, obj2) {
    return dist(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.r/2 + obj2.r/2;
};

//Displayed in reverse order (sorry but that's the best way it could be designed
var obj_count = [0, 0, 0, 0, 0]; 

/** Lynette's Inventory*/
var Inventory = function(x, y) {
    this.x = x;
    this.y = y;
    this.draw = function() {
         stroke(100, 100, 100);
    fill(200, 200, 200);
    rect(this.x, this.y, 555, 65);
    stroke(60, 60, 60);
    for(var i = 260; i < 750; i += 60) {
        fill(130, 130, 130);
        rect(i, 550, 50, 50);
    }
    
    var inc = 0;
    for (var i = 0; i < obj_count.length; i++) {
        if (obj_count[i] > 0) {
            fill(255, 255, 255);
            text(obj_count[i], 740 - 60 * inc, 570);
            inc++;
        }
    }
    };
};

var inventory = new Inventory(500, 550);


//Reference points for player testing
var tree = function(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.leaves = random(3, 5);
    this.draw = function() {
        noStroke();
        fill(11, 120, 18, 100);
        ellipse(this.x, this.y, this.r*this.leaves, this.r*this.leaves);
        fill(92, 46, 4);
        ellipse(this.x, this.y, this.r, this.r);
    };
    this.harvest = function()  {
        this.r -= 8;
    };
};
var trees = [];
trees.add = function(x, y) {
    trees.push(new tree(x, y));
};
trees.apply = function() {
    for(var i = 0; i < trees.length; i++) {
        trees[i].draw();
         if (trees[i].r === 0) {
            trees.splice(i, 1);
        }
    }
};

var bush = function(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.berries = [[this.x+8, this.y-4], [this.x-23, this.y+1],[this.x-11, this.y-17], [this.x-1, this.y+10]];
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
    this.dir = atan2(this.y - mouseY, mouseX - this.x);
    this.speedLimit = 3;
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
        if (Player.collectTree(trees[i]) === true) {
            trees[i].harvest();
            obj_count[0]++;
        }
    }
    for (var i = 0; i < bushes.length; i++) {
        if (Player.collectBush(bushes[i]) === true) {
            bushes[i].harvest();
            obj_count[1]++;
        }
    }
};

for(var i = 0; i < 450; i++) {
    var x = random(0, 4000);
    var y = random(0, 4000);
    var position = round(x/40)*100 + round(y/40);
    while(grid[position] < avg + 1){
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
    while(grid[position] > avg - 1){
        a = random(0, 4000);
        b = random(0, 4000);
        position = round(a/40)*100 + round(b/40);
    }
    bushes.add(a,b);
}


var scene = 0;
var draw = function() {
    if(scene === 0) {
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
        Player.update();
        popMatrix();
        Player.stats();
        rectMode(CENTER);
        inventory.draw();
    }
};
