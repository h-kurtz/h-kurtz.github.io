// Drag your mouse around the screen!
// Click to generate a new recursive pattern.

// Set this to a lower number if it's slowing down
// your computer
let loopMax = 12;
let randWidths = []
let randColorA = []
let randColorB = []

let minWidth = 16

let bgColA;
let bgColB;

let tmouseX = 0;
let tmouseY = 0;
let smoothing = 0.1;

let colMask = [0, 1, 1];

function setup() {
  let canvas = createCanvas(640, 640);
  canvas.parent("p5-frame")

  stroke(1);
  
  let randColors = getColors();
  bgColA = randColors[0]
  bgColB = randColors[1]
}

function draw() {
  background(getGrad(bgColA, bgColB, 0));
  
  tmouseX = tmouseX + ((mouseX - tmouseX) * smoothing)
  tmouseY = tmouseY + ((mouseY - tmouseY) * smoothing)
  
  makeSquare(0)
}

function mousePressed() {
  changeColorMask();

  randWidths = []
  randColorA = []
  randColorB = []

  let randColors = getColors();
  bgColA = randColors[0]
  bgColB = randColors[1]
}

function makeSquare(index) {
  let mid;
  let colA;
  let colB;
  
  if (randWidths.length - 1 < index) {
    mid = random(minWidth, width - minWidth)
    randWidths[index] = mid

    let randColors = getColors();
    colA = randColors[0]
    colB = randColors[1]
    randColorA[index] = colA
    randColorB[index] = colB
  } 
  else {
    mid = randWidths[index]
    colA = randColorA[index]
    colB = randColorB[index]
  }
      
  fill(getGrad(colA, colB, index))
  stroke(getGrad(colA, colB, index))
  
  if(index % 2 == 0) {
    mid = mid * tmouseX/width 
  }
  else {
    mid = mid * tmouseY/width 
  }
  
  rect(0, 0, mid, height)
  
  index++;
  
  if(index < loopMax) {
    
    push();
      translate(mid, height)
      rotate(-TWO_PI/4);
      scale(1.0, (width-mid)/width)
    
      makeSquare(index);
    pop();
    if(mid > minWidth) {
      index++;
      translate(mid, height)
      rotate(-TWO_PI/4);
      scale(1.0, -(mid)/width)
    
      makeSquare(index);
    }
  }
}

function getGrad(a, b, i) {
  return lerpColor(a, b, sin(i+millis(i)/1000))
}

function getColors() {
  let colorA = color(colMask[0] * random(128, 255), 
                     colMask[1] * random(128, 255), 
                     colMask[2] * random(128, 255))
  let colorB = color(colMask[0] * random(128), 
                     colMask[1] * random(128), 
                     colMask[2] * random(128))
  return [colorA, colorB];
}

function changeColorMask() {
  let ran = random(0.33)
  colMask = random([[ran, 1, 1], [1, ran, 1], [1, 1, ran]]);
}