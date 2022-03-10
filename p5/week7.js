let font;
let poem;

let wordPoints = [];
let points = [];

let minDist = 32;
let border = 128;

let lastLoc;

let curWord, tarWord;
let wordIndex = 0;

let tmouseX, tmouseY;

let distBetweenWords = 0;

let canGoBelowZero = false;

function preload() {
  font = loadFont("assets/Oswald-Medium.ttf");
  poem = loadStrings("assets/ozymandias.txt");
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("p5-frame")

  lastLoc = createVector(0, 0);
  
  poem.forEach(word => wordPoints.push(new WordData(word, 32)));
  
  curWord = new WordData(".", 32, 32);
  tarWord = wordPoints[0];

  distBetweenWords = curWord.loc.dist(tarWord.loc);

  tmouseX = mouseX;
  tmouseY = mouseY;
  
  frameRate(30);
  
  noStroke();
  fill(255);
}

function draw() {
  background(32);

  tmouseX = tmouseX + ((mouseX - tmouseX) * 0.1);
  tmouseY = tmouseY + ((mouseY - tmouseY) * 0.1);
  
  let amount = map(createVector(tmouseX, tmouseY).dist(tarWord.loc), 
    minDist, distBetweenWords - minDist, 1, 0);

  curWord.updateLocation(
    p5.Vector.sub(tarWord.loc, p5.Vector.sub(tarWord.loc, createVector(tmouseX, tmouseY)).setMag(distBetweenWords)), amount)
  
  if(amount >= 1) {
    wordIndex ++;

    curWord = tarWord;
    tarWord = wordPoints[wordIndex % wordPoints.length];

    distBetweenWords = curWord.loc.dist(tarWord.loc);

    canGoBelowZero = false;

    amount = 0;
  }
  else if (amount > 0.01) {
    canGoBelowZero = true;
  }    
  
  lerpPoints(curWord, tarWord, amount)
}

function lerpPoints(cur, tar, amt) {

  
  
  let maxPoints = max(cur.points.length, tar.points.length)
  
  for(let i = maxPoints - 1; i >= 0; i--) {
    let curPoint;
    let tarPoint;
    
    if(i < cur.points.length) {
      curPoint = cur.points[i];
    } 
    else {
      curPoint = cur.points[i % cur.points.length];
    }
    
    if(i < tar.points.length) {
      tarPoint = tar.points[i];
    } 
    else {
      tarPoint = tar.points[i % tar.points.length];
    }
     
    let adjAmt = ((i/maxPoints * 0.75) + 1) * amt
    if(adjAmt > 1) {
      adjAmt = 1;
    } else if(!canGoBelowZero && adjAmt < 0) {
      adjAmt = 0;
    }

    push(); 
    translate(lerp(cur.loc.x-cur.bounds.w/2, tar.loc.x-tar.bounds.w/2, adjAmt), 
              lerp(cur.loc.y + cur.bounds.h/2, tar.loc.y +tar.bounds.h/2, adjAmt));

    let col = cur.col;
    if(adjAmt > 0.5) {
      col = tar.col;
    }

    fill(lerpColor(color(128), col, abs(0.5 - adjAmt) * 2))
    
    let px = lerp(curPoint.x, tarPoint.x, adjAmt);
    let py = lerp(curPoint.y, tarPoint.y, adjAmt);
    ellipse(px, py, 2);
    pop();
  } 
}

class WordData {
  constructor(str, size, col = 224) {
    do {
      this.loc = createVector(random(border, width-border), random(border, height-border))
    } while(this.loc.dist(lastLoc) < minDist * 4);

    lastLoc = this.loc;

    this.col = color(col);

    this.points = font.textToPoints(str, 0, 0, size, {
      sampleFactor: 0.66,
      simplifyThreshold: 0
    });
    this.shufflePoints();

    this.bounds = font.textBounds(str, 0, 0, size)
  }
  
  shufflePoints() {
    for (let i = this.points.length - 1; i > 0; i--) {
      const j = floor(random() * (i + 1));
      const temp = this.points[i];
      this.points[i] = this.points[j];
      this.points[j] = temp;
    }
  }

  updateLocation (tarLoc, amt) {
    if(amt > 0 || canGoBelowZero) {
      tarLoc.sub(this.loc)
      this.loc.add(tarLoc.mult(0.1));
    }
  }
}