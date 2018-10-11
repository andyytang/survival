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
 * Make collide function COMPLETE
 * Make other inanimate objects
 * Other features that we need to add...
***/
textFont(createFont("Candara"), 15);
//Uninitialized variables for the Player and the camera (so things don't throw errors at us)
var Player;
var cam;
//A variable defining whether the map is shown
var togglemap = false; //Not working now with the inventory
var mapsize = 10000;
var keys = [];
var xoff = round(random(0, 10000));
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
//@key interaction
keyPressed = function(){keys[keyCode]=true;};
keyReleased = function(){ keys[keyCode]=false; };

/**
 * Key - (index of array is its id, deprecated id array)
 * 0 = wood
 * 1 = berry (WIP)
 * 2 = stone (WIP)
 * 3 = crafting box (WIP)
 *
 * */

var obj_count = [0, 0, 0, 0, 0]; //Displayed in reverse order (sorry but that's the best way it could be designed

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
      * (10000, 10000) lower right.
      * @param plyer an object that the camera is following which has x and y
    ***/
    this.view = function(plyer){
        this.x=plyer.x;
        this.y=plyer.y;
        
        this.x = constrain(this.x,this.w/2,10000-this.w/2);
        this.y = constrain(this.y,this.h/2,10000-this.h/2);
        translate(width/2-this.x,height/2-this.y);
    };
};

/***
 * Simple function to find if the object is in view of the camera.
 * @param obj the object that is to be analysed
***/
var view = function(obj){
    return obj.x+width/2-cam.x<width&&obj.x+width/2-cam.x>-obj.w&&
    obj.y+height/2-cam.y<height&&obj.y+height/2-cam.y>-obj.h;
};


var farview = function(obj){
    return obj.x+width*2-cam.x<width*8&&obj.x+width*2-cam.x>-obj.w&&
    obj.y+height*2-cam.y<height*8&&obj.y+height*2-cam.y>-obj.h;
};

//Reference points for player testing
//Reference points for player testing
var referencepoint = function(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 40;
    this.r = 40;
    this.leafmult = 5/4;
    this.leaves = round(random(3, 5));
    this.draw = function() {
        if(view(this)) { 
            noStroke();
    fill(11, 120, 18);
    ellipse(this.x, this.y, this.r*14/4, this.r*14/4);
    ellipse(this.x-58, this.y-8, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x-44, this.y-45, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x-9, this.y-60, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x+31, this.y-53, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x+59, this.y-23, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x+61, this.y+10, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x+43, this.y+43, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x+10, this.y+56, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x-26, this.y+55, this.leafmult*this.r, this.leafmult*this.r);
    ellipse(this.x-55, this.y+30, this.leafmult*this.r, this.leafmult*this.r);
    fill(92, 46, 4);
    ellipse(this.x, this.y, this.r, this.r);
        }
    };
    this.fardraw = function() {
        if(farview(this)) {
            fill(200, 100, 0);
            ellipse((this.x - 20 - Player.x)/16 + Player.x - 370, (this.y - 20 - Player.y)/16 + Player.y + 80, 2, 2);
        }
    };
    this.harvest = function()  {
        this.w -= (40/this.leaves);
        this.h -= (40/this.leaves);
    };
};
var refpoints = [];
refpoints.add = function(x, y) {
    refpoints.push(new referencepoint(x, y));
};
refpoints.apply = function() {
    for(var i = 0; i < refpoints.length; i++) {
        refpoints[i].draw();
    }
    if(togglemap) {
        for(var i = 0; i < refpoints.length; i++) {
            refpoints[i].fardraw();
        }
    }
};

var bush = function(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 40;
    this.r = 40;
    this.draw = function() {
        if(view(this)) { 
            noStroke();
            fill(19, 145, 21);
            ellipse(this.x, this.y, this.w, this.h);
            ellipse(this.x-20, this.y, this.w*(4/5), this.h*0.8);
            ellipse(this.x-9, this.y-15, this.w*0.7, this.h*0.7);
            fill(247, 15, 15);
            ellipse(this.x+8, this.y-4, this.w/5, this.h/5);
            ellipse(this.x-23, this.y+1, this.w/5, this.h/5);
            ellipse(this.x-11, this.y-17, this.w/5, this.h/5);
            ellipse(this.x-1, this.y+10, this.w/5, this.h/5);
        }
    };
    this.fardraw = function() {
        if(farview(this)) {
            fill(255, 255, 255);
            ellipse((this.x - 20 - Player.x)/16 + Player.x - 370, (this.y - 20 - Player.y)/16 + Player.y + 80, 2, 2);
        }
    };
    this.harvest = function()  {
        //Implement stuff, I'll see lawrence
        this.w -= 10;
        this.h -= 10;
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
    if(togglemap) {
        for(var i = 0; i < bushes.length; i++) {
            bushes[i].fardraw();
        }
    }
};

var player = function(x, y) {
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.w = 20;
    this.h = 20;
    this.dir = atan2(this.y - mouseY, mouseX - this.x);
    this.speedLimit = 3;
    this.draw = function() {
        noStroke();
        fill(255, 224, 157);
        pushMatrix();
        translate(this.x, this.y);
        rotate(this.dir);
        ellipse(0, 0, 20, 20);
        rect(0, 6, 20, 5, 2);
        popMatrix();
        fill(0);
        if(togglemap) {
            pushMatrix();
            translate(this.x - 370, this.y + 70);  
            rotate(this.dir);
            stroke(0);
            ellipse(0, 0, 4, 4);
            line(0, 0, 5, 0);
            noStroke();
            popMatrix();
            fill(0, 0, 255, 20);
            rect(this.x - width/2, this.y, 450, 300);
        }
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
        this.y += this.yspeed;
        this.x += this.xspeed;
        this.xspeed *= 0.93;
        this.yspeed *= 0.93;
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
    this.collectTree = function(refpoint){
        return abs(this.x - refpoint.x)*2 < (refpoint.w*refpoint.leaves) && abs(this.y - refpoint.y)*2 < (refpoint.w*refpoint.leaves);
    };
};
Player = new player(5000, 5000);
cam = new Camera(Player.x, Player.y);

mouseClicked = function() {
    for (var i = 0; i < refpoints.length; i++) {
        if (Player.collectTree(refpoints[i]) === true) {
            refpoints[i].harvest();
            obj_count[0]++;
        }
    }
};

for(var i = 0; i < 1000; i++) {
    var x = random(0, 10000);
    var y = random(0, 10000);
    var position = round(x/100)*100 + round(y/100);
    while(grid[position] < avg){
        x = random(0, 10000);
        y = random(0, 10000);
        position = round(x/100)*100 + round(y/100);
    }
    refpoints.add(x, y);  
}
        

for(var i = 0; i < 500; i++) {
    var a = random(0, 10000);
    var b = random(0, 10000);
    var position = round(a/100)*100 + round(b/100);
    while(grid[position] > avg - 1){
        a = random(0, 10000);
        b = random(0, 10000);
        position = round(a/100)*100 + round(b/100);
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
        Player.draw();
        refpoints.apply();
        bushes.apply();
        Player.update();
        popMatrix();
        Player.stats();
        rectMode(CENTER);
        inventory.draw();
    }
};
