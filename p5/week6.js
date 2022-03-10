// Intestinal Journey!
// by Harrison Kurtz

// Use the mouse to point your flashlight.
// Wait to see if you can find anything 
// within these fleshy tunnels.

let minSpeed = 2.5;
let maxSpeed = 1.25;
let speed = minSpeed;
let speedRampTime = 20;

let updateWidth = 160
let segNum = 16;
let offsetDist = 240

let ambientColor;
let endColor;

let counter = 0.0;

let grubProb = 0.1;
let grubs = new Array(segNum);

let grubModels = []

function preload() {
  grubModels = [
    [loadModel('assets/banana.obj', true), color("yellow"), false],
    [loadModel('assets/coffee.obj', true), loadImage("assets/coffee.png"), true],
    [loadModel('assets/chicken.obj'), loadImage("assets/chicken.jpg"), true],]
}

function setup() {
  let canvas = createCanvas(640, 480, WEBGL);
  canvas.parent("p5-frame");
  noStroke();
  ambientColor = color(48, 12, 12);
  endColor = color("darkred");
  //normalMaterial();

  grubs.push(new Grub());
}

function draw() {
  background(16, 0, 0);

  speed = map((millis()/1000)/10, 0, 1, minSpeed, maxSpeed, true)

  counter += deltaTime/speed
  if (counter > updateWidth) {
    counter = counter - updateWidth;
    cycleGrub();
  }
  let prog = counter
  
  lightFalloff(0.25, 0.0025, 0);
  
  // direct a light towards the mouse cursor
  let locX = (mouseX - width / 2)/3;
  let locY = (mouseY - height / 2)/3;
  let vec = new p5.Vector(locX, locY, -100)
  spotLight(color("white"), 0, 0, 400, vec, 90);
  ambientLight(ambientColor);
  
  translate(0, 0, prog + offsetDist)
  
  for (let i = 0; i < segNum; i++) {
    let progScaled = (i-(prog-(offsetDist/2))/updateWidth)
    
    fill(lerpColor(color("pink"), endColor, progScaled/segNum));
    torus(updateWidth, 80);

    if(grubs[i] != null) {
      grubs[i].display();
    } 
    
    translate(progScaled * sin(millis()/5000) * 9, 
               progScaled * sin(millis()/8000) * 9, -updateWidth);

    //slightly scale down so vanishing point isnt so obvious
    scale(1 - progScaled * 0.01, 1 - progScaled * 0.01, 1)
  }
}

function cycleGrub() {
  grubs.shift();

  if(random()< grubProb) {
    grubs.push(new Grub());
  }
  else {
    grubs.push(null);
  }
}

class Grub {
  constructor() {
    let angle = random(2 * PI);
    let dist = random([50, 160]);

    this.x = sin(angle) * dist;
    this.y = cos(angle) * dist;

    this.data = random(grubModels)

    this.model = this.data[0];
    
    if(this.data[2]) {
      this.texture = this.data[1]
    } 
    else {
      this.color = this.data[1];
    }
  }

  display() {
    push(); 
      translate(this.x, this.y, 0);
    
      if(this.data[2]) {
        texture(this.texture);
      }
      else {
        fill(this.color);
      }
      scale(0.25)

      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      model(this.model);
    pop();
  }
}