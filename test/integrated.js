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
 * 1 = berry
 * 2 = stone
 * 3 = pickaxe (WIP)
 * 4 = campfire
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
var scene = -1;
var timeOfDay = 0;
//The actual inventory
var obj_count = [0, 0, 0, 1, 0];
var obj_order = [3];
var score = 0;
textFont(createFont("monospace"), 15);
}

//@MAP GENERATION

var grid = [];
var stdev = 0;
var sum = 0;  
var avg;
var newMap = function(){
    var xoff = round(random(0, 4000));
    /**
     * Map generation algorithm: use noise to map out 40px by 40px
     * precipitation sections. Shown on large map when m is pressed.
    **/
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
    avg = sum/10000;
    stdev = 0;
    // Find standard deviation
    for(var i = 0; i < grid.length; i++) {
        stdev += Math.pow(abs(grid[i] - avg), 2);
    }
    stdev /= 10000;
    stdev = Math.sqrt(stdev);
};
//@KEY INTERACTION
{
keyPressed = function(){
    // Set the keycode to true
    keys[keyCode] = true;
    // If 'm' pressed toggle the map
    if(keys[77]) {
        togglemap = !togglemap;
    }
    // If number key pressed select item in inventory
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

//@ICONS
{
//@FIRE ICON
{
/**
 * Fire icon in inventory. 
 * @param x the x-location
 * @param y the y-location
 * @constructor set the x and y position
**/
var SmallFire = function(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.time = 0;
};
// Drawing function
SmallFire.prototype.draw = function() {
    rectMode(LEFT);
    if (this.type === true){
        fill(255, 235, 0, 140);
        ellipse(this.x, this.y, 65, 65);
        fill(255, 235, 0, 120);
        ellipse(this.x, this.y, 105, 105);
        if (this.time % 50 === 0 && this.time > 0 && Player.inFireRange(this) === true){
            Player.health = Player.health + 1;
        }
        if (this.time < 500){
            this.time++;
        } else {
            this.time = 0;
            this.type = false;
        }
    }// Draw wood
    for(var i = 0; i < 360; i += 36) {
        pushMatrix();
        translate(this.x, this.y);
        rotate(i);
        noStroke();
        fill(92, 46, 4);
        rect(-20, -3, 30, 5);
        popMatrix();
    }
    
    // Draw fire segments
    fill(255, 0, 0);
    rectMode(CENTER);
    rect(this.x, this.y, 19, 19);
    pushMatrix();
    translate(this.x, this.y);
    rotate(45);
    rect(0, 0, 19, 19);
    popMatrix();
    
    fill(255, 125, 0);
    rect(this.x, this.y, 14, 14);
    pushMatrix();
    translate(this.x, this.y);
    rotate(45);
    rect(0, 0, 14, 14);
    popMatrix();
    
    fill(255, 205, 0);
    rect(this.x, this.y, 8, 8);
    pushMatrix();
    translate(this.x, this.y);
    rotate(45);
    rect(0, 0, 8, 8);
    popMatrix();
};
}
//@BIG FIRE ICON
//@PICKAXE ICON
{
/**
 * Pickaxe icon in inventory. 
 * @param x the x-location
 * @param y the y-location
 * @constructor set the x and y position
**/
var pickAxeHealth = 20;

var Pickaxe = function(x, y){
    this.x = x;
    this.y = y;
};
// Draw pickaxe
Pickaxe.prototype.draw = function() {
    rectMode(LEFT);
    noStroke();
    
    fill(110, 53, 53);
    rect(this.x, this.y, 5, 35);
    
    stroke(130, 130, 130);
    fill(200, 200, 200);
    rect(this.x-5, this.y, 15, 6);

    triangle(this.x-5, this.y, this.x-5, this.y+7, this.x-19, this.y+12);
    triangle(this.x+10, this.y, this.x+10, this.y+7, this.x+24, this.y+12);
    
    strokeWeight(2);
    stroke(200, 200, 200);
    line(this.x-5, this.y+1.5, this.x-5, this.y+4);
    line(this.x+10, this.y+1.5, this.x+10, this.y+4);
    strokeWeight(1);
    stroke(0, 0, 0);
    fill(11, 186, 28, 100);
    rect(this.x - 12, this.y + 25, 32, 10);
    fill(11, 186, 28);
    rect(this.x - 12, this.y + 25, pickAxeHealth * 1.6, 10);
    if (pickAxeHealth <= 0){
        obj_count[3]--;
        obj_order.splice(obj_order.indexOf(3), 1);
        pickAxeHealth = 20;
    }
};

}
//@WOOD ICON
{
/**
 * Wood icon in inventory. 
 * @param x the x-location
 * @param y the y-location
 * @param size the size
 * @constructor set the x and y position, and size
**/
var Wood = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
// Draw the wood icon
Wood.prototype.draw = function() {
    noStroke();
    rectMode(CENTER);
    pushMatrix();
    translate(this.x, this.y);
    rotate(-45);
    fill(110, 53, 53);
    rect(0, 0, this.size, this.size*2);
    ellipse(0, 15, this.size-1, this.size-5);
    stroke(110, 53, 53);
    strokeWeight(1);
    fill(247, 195, 111);
    ellipse(0, -15, this.size-1, this.size-5);
    popMatrix();
};
}
//@STONE ICON
{
/**
 * Stone icon in inventory. 
 * @param x the x-location
 * @param y the y-location
 * @param size the size
 * @constructor set the x and y position and size
**/
var StoneItem = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
//Draw stone icon
StoneItem.prototype.draw = function() {
    strokeWeight(1);
    stroke(33, 33, 33);
    fill(100, 100, 100);
    ellipse(this.x, this.y, this.size, this.size);
    ellipse(this.x+13, this.y+7, this.size - 13, this.size-13);
};
}
//@BERRIES ICON
{
/**
 * Berry icon in inventory. 
 * @param x the x-location
 * @param y the y-location
 * @param size the size
 * @constructor set the x and y position and size
**/
var Berries = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
//Draw the berries
Berries.prototype.draw = function() {
    stroke(0, 10, 130);
    fill(0, 45, 255);
    ellipse(this.x, this.y, this.size, this.size);
    ellipse(this.x+10, this.y+5, this.size, this.size);
    ellipse(this.x-3, this.y+11, this.size, this.size);
    noStroke();
    fill(15, 10, 168);
    ellipse(this.x-3, this.y-5, this.size-11, this.size-11);
    ellipse(this.x+15, this.y+2, this.size-11, this.size-11);
    ellipse(this.x-8, this.y+10, this.size-11, this.size-11);
};
}
}


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
        for (var n = 0; n < obj_count.length; n++){
            if (obj_count[n] > 0 && obj_order.includes(n) === false){
                obj_order.push(n);
            }
        }
        var inc = 0;
        var pickHealth = 20;
        for (var i = 0; i < obj_order.length; i++) {
                fill(255, 255, 255);
                switch (obj_order[i]) {
                    case 0:
                        var wood = new Wood(380 + 60 * inc, 550, 16);
                        wood.draw();
                        break;
                    case 1:
                        var berries = new Berries(380 + 60 * inc, 546, 18);
                        berries.draw();
                        break;
                    case 2:
                        var stoneItem = new StoneItem(380 + 60 * inc, 550, 30);
                        stoneItem.draw();
                        break;
                    case 3:
                        var pickaxe = new Pickaxe(378 + 60 * inc, 533);
                        pickaxe.draw();
                        break;
                    case 4:
                        var fire = new SmallFire(380 + 60 * inc, 550, false);
                        fire.draw();
                        break;
                    default:
                        break;
                }
                if (obj_order[i] !== 3){
                    fill(255, 255, 255);
                    textSize(25);
                    text(obj_count[obj_order[i]], 377 + 60 * inc, 565);
                }
                inc++;
            if (obj_count[obj_order[i]] === 0) {
                obj_order.splice(i, 1);
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
    this.nomore = false;
    /***
     * Before I forget:
     * booleans[0] = need fire?
     * booleans[1] = need crafting?
    ***/
    this.booleans = booleans;
    this.isPossible = function() {
        for(var i = 0; i < counts.length; i++) {
            if(obj_count[i] < counts[i]) {
                return false;
            }
        }
        if (obj_order.length > 5){
            return false;
        }
        if (obj_count[3] === 1 && this.desc === "pickaxe"){
            return false;
        }
        return true;
    };
    this.drawapply = function(x, y) {
        if(mouseX > x && mouseY > y && mouseX < x + 40 && mouseY < y + 40) {
            stroke(this.color);
            strokeWeight(1);
            fill(this.color, 50);
            rect(x, y, 200, 40, 3);
            fill(0);
            text(this.desc, x + 10, y + 27);
            if(mouseIsPressed && !this.nomore) {
                for(var i = 0; i < obj_count.length; i++) {
                    obj_count[i] -= counts[i];
                }
                obj_count[outpt[1]] += outpt[0];
                Player.food += outpt[2];
                Player.health += outpt[3];
                if (Player.food > 100){
                    Player.food = 100;
                }
                if (Player.health > 100){
                    Player.health = 100;
                }
                this.nomore = true;
            }
        }
        else {
            stroke(this.color);
            fill(this.color, 50);
            rect(x, y, 40, 40, 3);
        }
        if(!mouseIsPressed) {
            this.nomore = false;
        }
    };
};

var recipes = [];
recipes.add = function(counts, desc, outpt, booleans) {
    recipes.push(new recipe(counts, desc, outpt, booleans));
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


var fires = [];
fires.add = function(x, y, type){
    fires.push(new SmallFire(x, y, type));
};
fires.apply = function(){
     for(var i = 0; i < fires.length; i++) {
        fires[i].draw();
    }
};

//Trees
var tree = function(x, y, leaves) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.dir = atan2(this.y - Player.y, this.x - Player.x);    
    this.deg = round((((-1*Math.sign(this.dir)+1)/2)*360 + this.dir)*100)/100;
    this.leaves = leaves;
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
    this.updatePos = function() {
        this.dir = atan2(this.y - Player.y, this.x - Player.x);
        this.deg = round((((-1*Math.sign(this.dir)+1)/2)*360 + this.dir)*100)/100;
    };
};
var trees = [];
trees.add = function(x, y, leaves) {
    trees.push(new tree(x, y, leaves));
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
        this.r -= 7;
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
        //if(view(this)) { 
            noStroke();
            fill(19, 145, 21);
             if (this.berries.length !== 0){
            ellipse(this.x, this.y, this.r, this.r);
            ellipse(this.x-20, this.y, this.r*(4/5), this.r*0.8);
            ellipse(this.x-9, this.y-15, this.r*0.7, this.r*0.7);
            
            for (var i = 0; i < this.berries.length; i++){
                fill(15, 10, 168);
               ellipse(this.berries[i][0], this.berries[i][1], this.r/5, this.r/5);
            }
             }
        //}
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
        if(bushes[i].berries === 0) {
            bushes.splice(i, 1);
        }
    }
};


//For the rabbit
var wolves = [];

//rabbit -- WIP
var rabbit = function(number) {
    this.number = number;
    this.x = random(0, 4000);
    this.y = random(0, 4000);
    this.r = 40;
    this.health = 100;
    this.viewradius = 300;
    this.dir = 0;
    this.minbush = -1;
    this.minlength = this.viewradius;
    this.food = 0;
    this.addrabbit = false;
    this.draw = function() {
        stroke(1);
        fill(239,222,205);//body
        rect(this.x, this.y, 17, 13);
        
        //back legs
        rect(this.x+9, this.y-1, 7, 1);
        rect(this.x+9, this.y+13, 7, 1);
        
        //front legs
        rect(this.x, this.y-1, 4, 1);
        rect(this.x, this.y+13, 4, 1);
        
        //tail
        rect(this.x+17, this.y+3, 3, 7);
        
        //head
        rect(this.x-9, this.y+1, 9, 11);
        
        //ears
        rect(this.x-4, this.y+2, 2, 3);
        rect(this.x-4, this.y+8, 2, 3);
    };
    // Rudimentary: make it go towards bushes and avoid wolves
    this.update = function() {
        // Based on player location
        this.minbush = -1;
        this.minlength = 300;
        
        for(var i = 0; i < bushes.length; i++) {
            //In view
            if(dist(this.x, this.y, bushes[i].x, bushes[i].y) < this.minlength) {
                this.minlength = dist(this.x, this.y, bushes[i].x, bushes[i].y);
                this.minbush = i;
            }
        }
        if(this.minbush !== -1) {
            this.dir = atan2(this.x - bushes[this.minbush].x, bushes[this.minbush].y - this.y) + round(random(-10, 10)) + 90;
            this.x += cos(this.dir);
            this.y += sin(this.dir);
            if(dist(this.x, this.y, bushes[this.minbush].x, bushes[this.minbush].y) < 20 && frameCount % 40 === this.number) {
                bushes[this.minbush].harvest();
                this.food++;
            }
            if(this.food === 10) {
                this.food = 0;
                this.addrabbit = true;
            }
        }
        else {
            this.dir += random(-2, 2);
            this.x += cos(this.dir);
            this.y += sin(this.dir);
        }
    };
};
//Darn english grammar
var rabbits = [];
rabbits.add = function() {
    rabbits.push(new rabbit(rabbits.length));
};
rabbits.apply = function() {
    for(var i = 0; i < rabbits.length; i++) {
        rabbits[i].draw();
        rabbits[i].update();
        if(rabbits[i].x < 0) {
            rabbits[i].x += 4000;
        }
        else if(rabbits[i].x > 4000) {
            rabbits[i].x -= 4000;
        }
        else if(rabbits[i].y < 0) {
            rabbits[i].y += 4000;
        }
        else if(rabbits[i].y > 4000) {
            rabbits[i].y -= 4000;
        }
        if(rabbits[i].health <= 0) {
            rabbits.splice(i, 1);
        }
        if(i < rabbits.length && rabbits[i].addrabbit && rabbits.length < 40) {
            rabbits.add();
            rabbits[i].addrabbit = false;
        }
    }
};

//Wolves -- WIP
var wolf = function() {
    this.x = random(0, 4000);
    this.y = random(0, 4000);
    this.dir = 0;
    this.health = 200;
    this.hearradius = 600;
    this.food = 0;
    this.target = -1;
    this.draw = function() {
        pushMatrix();
        translate(this.x, this.y);
        rotate(this.dir+180);
        //body
        stroke(50, 50, 50);
        fill(214, 214, 214);
        rect(0, 0, 30, 13);
        rect(0, -3, 12, 19);
        
        //head
        rect(-8, -1, 8, 15);
        
        //ears
        stroke(0, 0, 0);
        rect(-3, 0, 1, 4);
        rect(-3, 9, 1, 4);
        
        //snout
        stroke(50, 50, 50);
        fill(214, 214, 214);
        rect(-16, 3, 8, 8);
        //tail
        fill(212, 212, 212);
        rect(30, 5, 8, 3);
        popMatrix();
    };
    // Rudimentary: make it move towards player or rabbit
    this.update = function() {
        if(this.target !== -1) {
            this.dir = atan2(this.x - rabbits[this.target].x, rabbits[this.target].y - this.y) + 90;
            this.x += cos(this.dir)*1.5;
            this.y += sin(this.dir)*1.5;
            if(dist(this.x, this.y, rabbits[this.target].x, rabbits[this.target].y) < 20 && frameCount%50 === 0) {
                rabbits[this.target].health -= 20;
                if(rabbits[this.target].health <= 0) {
                    this.food += 20;
                    this.target = -1;
                }
            }
        }
        else{
            for(var i = 0; i < rabbits.length; i++) {
                if(dist(this.x, this.y, rabbits[i].x, rabbits[i].y) < this.hearradius) {
                    //Move towards the rabbit
                    this.target = i;
                    this.dir = atan2(this.x - rabbits[i].x, rabbits[i].y - this.y) + 90;
                    this.x += cos(this.dir)*1.5;
                    this.y += sin(this.dir)*1.5;
                    if(dist(this.x, this.y, rabbits[i].x, rabbits[i].y) < 20 && frameCount%50 === 0) {
                        rabbits[i].health -= 20;
                        if(rabbits[i].health <= 0) {
                            this.food += 20;
                            this.target = -1;
                        }
                        break;
                    }
                }
            }
            if(this.target === -1 && dist(this.x, this.y, Player.x, Player.y) < this.hearradius) {
                //Move towards the player accurately
                this.dir = atan2(this.x - Player.x, Player.y - this.y) + 90;
                this.x += cos(this.dir)*1.4;
                this.y += sin(this.dir)*1.4;
                if(dist(this.x, this.y, Player.x, Player.y) < 20 && frameCount%50 === 0) {
                    Player.health -= 10;
                }
            }
        }
    };
};
wolves.add = function() {
    wolves.push(new wolf());
};
wolves.apply = function() {
    for(var i = 0; i < wolves.length; i++) {
        wolves[i].draw();
        wolves[i].update();
    }
};

for(var i = 0; i < 3; i++) {
    wolves.add();
}

for(var i = 0; i < 4; i++) {
    rabbits.add();
}


var player = function(x, y) {
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.speedIncrement = 0.1;
    this.r = 20;
    this.interval = 0;
    this.health = 50;
    this.food = 50;
    this.dir = atan2(this.y - mouseY, mouseX - this.x);
    this.negative = false;
    this.speedLimit = 3;
    this.bars = function() {
        rectMode(LEFT);
        strokeWeight(1);
        stroke(0,0,0);
        fill(250, 13, 13, 100);
        rect(342, 482, 210, 12);
        fill(250, 13, 13);
        rect(342, 482, this.health*2.1, 12);
        fill(230, 145, 10, 100);
        rect(342, 500, 210, 12);
        fill(230, 145, 10);
        rect(342, 500, this.food*2.1, 12);
    };
    this.dayChange = function(){
        if(this.negative) {
            timeOfDay -= 0.05;
        }
        else { 
            timeOfDay += 0.05;
        }
        if(timeOfDay > 180) {
            this.negative = true;
        }
        if(timeOfDay < 10) {
            this.negative = false;
        }
    };
    this.draw = function() {
        noStroke();
        rectMode(CORNER);
        fill(255, 224, 157);
        pushMatrix();
        translate(this.x, this.y);
        rotate(this.dir);
        stroke(125, 125, 125);
        fill(255, 225, 160);
        rect(2, 4, 13, 6, 3);
        rect(2, -11, 13, 6, 3);
        ellipse(0, 0, 23, 23);
        if (obj_order[inventory.selected] === 3){
        var pickX = 8;
        var pickY = 5;
        stroke(130, 130, 130);
        fill(200, 200, 200);
        triangle(pickX+5, pickY, pickX+5, pickY+6, pickX-4, pickY+2.5);
        triangle(pickX+11, pickY, pickX+11, pickY+6, pickX+20, pickY+2.5);
        rect(pickX+4, pickY, 7, 5);
        stroke(200, 200, 200);
        line(pickX+4, pickY+2, pickX+4, pickY+4);
        line(pickX+11, pickY+1, pickX+11, pickY+4);
        }
        fill(0);
        stroke(0);
        popMatrix();
    };
    this.update = function() {
        if (keys[16]){
            this.speedIncrement = 0.15;
            this.speedLimit = 4;
        } else {
            this.speedIncrement = 0.1;
            this.speedLimit = 3;
        }
        if(keys[UP] || keys[87]) {
            this.yspeed -= this.speedIncrement;
        }
        if (keys[DOWN] || keys[83]) {
            this.yspeed += this.speedIncrement;
        }
        if(keys[LEFT] || keys[65]){
            this.xspeed -= this.speedIncrement;
        }
        if(keys[RIGHT] || keys[68]) {
            this.xspeed += this.speedIncrement;
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
        for (var i = 0; i < trees.length; i++){
            trees[i].updatePos();
        }
    };
    this.starve = function(){
        if (this.speedLimit === 4){
            this.interval += 5;
        }
        this.interval++;
        if (this.interval % 500 === 0 && this.interval > 0){
            if (this.food !== 0){
                this.food -= 5;
            }
            if (this.food < 20){
                this.health -= (20 - this.food)/4;
            }
        }
    };
    this.stats = function() {
        textSize(15);
        fill(0);
        text("Location: (" + round(this.x*100)/100 + ", " + round(this.y*100)/100 + ")", 20, 20);
        text("Facing: " + (round((((-1*Math.sign(this.dir)+1)/2)*360 + this.dir)*100)/100) + " degrees from East", 20, 35);
    };
    this.collectTree = function(tree){
        var degree = round((((-1*Math.sign(this.dir)+1)/2)*360 + this.dir)*100)/100;
        var phi =  Math.abs(degree - tree.deg) % 360; 
        var distance = phi > 180 ? 360 - phi : phi;
        return abs(this.x - tree.x)*2 < (tree.r*tree.leaves) && abs(this.y - tree.y)*2 < (tree.r*tree.leaves) && (abs(distance) <= 30);
    };
    this.collectBush = function(bush){
        return abs(this.x - bush.x)*2 < (bush.r * 1.5) && abs(this.y - bush.y)*2 < (bush.r * 1.5);
    };
    this.collectStone = function(stone){
        return abs(this.x - stone.x)*2 < (stone.r * 1.5) && abs(this.y - stone.y)*2 < (stone.r * 1.5);
    };
    this.inFireRange = function(fire){
        return abs(this.x - fire.x) < (105) && abs(this.y - fire.y)*2 < (105);
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
Player = new player(random(1000, 3000), random(1000, 3000));
cam = new Camera(Player.x, Player.y);

var fireIndex = 0;

var Button = function(x, y, w, h){
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
};

Button.prototype.draw = function() {
   rectMode(LEFT);
   stroke(80, 80, 80);
   strokeWeight(3);
   if (this.isMouseInside(mouseX, mouseY)){
       fill(124, 148, 143);
   } else{
       fill(180, 180, 180);
   }
   rect(this.x, this.y, this.width, this.height, 6);
   fill(0, 0, 0);
};

Button.prototype.isMouseInside = function(x, y) {
    return x > this.x &&
           x < (this.x + this.width) &&
           y > this.y &&
           y < (this.y + this.height);
};

var startButton = new Button(425, 300, 165, 60);

var howToPlayButton = new Button(390, 390, 250, 60);

var playAgain = new Button(387, 340, 250, 60);

var returnToMainMenu = new Button(387, 420, 250, 60);

var generateMap = function(){
    
bushes.splice(0,bushes.length);
trees.splice(0,bushes.length);
stones.splice(0, stones.length);

var centerx = random(1000, 3000);
var centery = random(1000, 3000);
for(var i = 0; i < 50; i++) {
    var a = random(centerx - 300, centerx + 300);
    var b = random(centery - 300, centery + 300);
    stones.add(a,b);
}

for(var i = -9; i <= 9; i++) {
    for(var j = -9; j <= 9; j++) {
        grid[round(centerx/40)*100 + i*100 + round(centery/40) + j] = 0; 
    }
}

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
    trees.add(x, y, random(3, 5.5));
}


for(var i = -9; i <= 9; i++) {
    for(var j = -9; j <= 9; j++) {
        grid[round(centerx/40)*100 + i*100 + round(centery/40) + j] = 300; 
    }
}        

for(var i = 0; i < 250; i++) {
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

for(var i = -9; i <= 9; i++) {
    for(var j = -9; j <= 9; j++) {
        grid[round(centerx/40)*100 + i*100 + round(centery/40) + j] = 100; 
    }
}
};

mouseClicked = function() {
    if(startButton.isMouseInside(mouseX, mouseY) && scene === -1){
        scene = 0;
    }
    if (returnToMainMenu.isMouseInside(mouseX, mouseY) && scene === 1){
        scene = -1;
    }
    if (playAgain.isMouseInside(mouseX, mouseY) && scene === 1){
        grid = [];
        generator = new Random(1);
        stdev = 0;
        sum = 0;
        newMap();
        fires.splice(0, fires.length);
        generateMap();
        obj_count = [0, 0, 0, 0, 0];
        obj_order = [];
        timeOfDay = 0;
        scene = 0;
    }
    if (scene === 0){
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
        if (Player.collectStone(stones[i]) === true && obj_count[2] < 64 && obj_count[3] > 0 && obj_order[inventory.selected] === 3) {
            stones[i].harvest();
            obj_count[2]++;
            pickAxeHealth -= 2;
        }
    }
    if (obj_count[4] > 0 && inventory.selected === obj_order.indexOf(4)){
       fires.add(Player.x, Player.y, true);
       obj_count[4]--;
    }
    }
};

newMap();
generateMap();
    /***
     * Before I forget:
     * outpt[0] = number of items
     * outpt[1] = item type
     * outpt[2] = any food?
     * outpt[3] = any health?
     * Need counts, desc, outpt, booleans
    ***/
recipes.add([15, 0, 0, 0, 0], "pickaxe", [1, 3, 0, 0], [false, false]);
recipes.add([30, 0, 5, 0, 0], "fire", [1, 4, 0, 0], [false, false]);
recipes.add([0, 3, 0, 0, 0], "trail mix", [0, 0, 5, 0], [false, false]);



var backgroundThing = function(){
    
    var treePos = [[180, 100], [130, 300], [240, 490], [440, 590], [740, 510], [880, 380], [600, 30], [400, 10], [-5, 140], [40, -55], [30, 455], [100, 655], [620, 670], [930, 610], [900, -15], [1040, 220]];
    
    for (var i = 0; i < treePos.length; i++){
        var Tree = new tree(treePos[i][0], treePos[i][1], 4);
        Tree.draw();
    }
    
    var berryBushA = new bush(260, 5);
    var berryBushB = new bush(15, 270);
    var berryBushC = new bush(230, 380);
    var berryBushD = new bush(570, 550);
    var berryBushE = new bush(900, 500);
    var berryBushF = new bush(740, 50);
    var berryBushG = new bush(950, 120);
    
    berryBushA.draw();
    berryBushB.draw();
    berryBushC.draw();
    berryBushD.draw();
    berryBushE.draw();
    berryBushF.draw();
    berryBushG.draw();
    
    
    var fire = new SmallFire(833, 208, true);
    fire.draw();
};
var TitleScreen= function() {
    background(110, 200, 90);
    
    textSize(80);
    fill(0, 0, 0);
    text("To Build A Fire", 300, 250);
    
    /*stroke(80, 80, 80);
    strokeWeight(3);
    fill(180, 180, 180);
    
    rect(490, 330, 165, 60, 6);
    */
    
    
    startButton.draw();
    
    textSize(40);
    text("Play", 470,342);
    
    howToPlayButton.draw();
    textSize(35);
    fill(0, 0, 0);
    text("Instructions", 430, 428);
    backgroundThing();
    
    
    fill(0,0,0);
    textSize(25);
    text("TBaF v0.01", 25, 575);
    text("Created for a school project", 675, 575);
        
    pushMatrix();
    rotate(-20);
    textSize(25);
    fill(255,255,255);
    text("With splash texts!", 476,477);
    popMatrix();
};


var gameOver = function(){
    background(50, 75, 40);
    var score = floor(Player.interval/1000);
    textSize(70);
    fill(255, 255, 255);
    text("You died!", 376, 250);
    fill(255, 255, 255);
    textSize(35);
    text("Score: " + score + " seconds" , 394, 300);
 
    backgroundThing();
    playAgain.draw();
    returnToMainMenu.draw();
    textSize(35);
    text("Respawn", 451,380);
    text("Title Menu", 441, 460);
};

noStroke();
var draw = function() {
    if(scene === -1){
        
        TitleScreen();
    }
    if(scene === 0) {
        if(!togglemap) {
            if(frameCount % 50 === 0) {
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
            background(20 + timeOfDay/2, 20 + timeOfDay, 50 + timeOfDay/10);
            rectMode(CORNER);
            Player.stats();
            pushMatrix();
            cam.view(Player);
            stroke(255, 0, 0);
            line(0, 0, mapsize, 0);
            line(0, 0, 0, mapsize);
            line(mapsize, 0, mapsize, mapsize);
            line(0, mapsize, mapsize, mapsize);
            bushes.apply();
            fires.apply();
            Player.draw();
            trees.apply();
            stones.apply();
            rabbits.apply();
            wolves.apply();
            Player.update();
            Player.starve();
            Player.dayChange();
            popMatrix();
            rectMode(CENTER);
            inventory.draw();
            rectMode(CORNER);
            recipes.apply();
            rectMode(CENTER);
            Player.bars();
            if (Player.health <= 0){
                scene = 1;
            }
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
            fires.apply();
            rabbits.apply();
            wolves.apply();
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
            for(var i = 0; i < rabbits.length; i++) {
                stroke(0, 0, 255);
                point(rabbits[i].x/10, rabbits[i].y/10);
                stroke(100, 100, 100);
                if(rabbits[i].minbush !== -1) {
                    point(bushes[rabbits[i].minbush].x/10, bushes[rabbits[i].minbush].y/10);
                }

            }
            for(var i = 0; i < wolves.length; i++) {
                stroke(255,255,0);
                point(wolves[i].x/10, wolves[i].y/10);
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
    if (scene === 1){
        gameOver();
    }
};
