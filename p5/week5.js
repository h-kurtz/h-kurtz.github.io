// Harp5 by Harrison Kurtz

// Click to create a new string!
// Pluck a string by mousing over.
// Experiment with different speeds and horizontal positions.
// Press F to see "fret markings"

// Inspired by https://editor.p5js.org/barbara_im/sketches/9DKzw2fSo
// from barbara_im

let pianoStrings = []
let minNote = 21;
let maxNote = 87;
let vibeH = 8;
let reverb;

let audioStart = false;

function setup() {
  let canvas = createCanvas(480, 860);
  canvas.parent("p5-frame");
  
  strokeWeight(2);
  noFill();

  outputVolume(0.25);

  //reverb = new p5.Reverb();
  //reverb.drywet(0.33);
}

function draw() {
  background(32);
  
  if(keyIsDown(70)) {
    placeMarkers();
  }

  pianoStrings.forEach(pianoString => pianoString.display())
}

function placeMarkers() {
  push();
  noStroke();
  fill(20)
  for(let i = minNote + 15; i < maxNote; i += 12) {
    circle(width/2, map(midiToFreq(i),     midiToFreq(minNote), midiToFreq(maxNote), height, 0), 16)
    circle(width/2, map(midiToFreq(i + 7), midiToFreq(minNote), midiToFreq(maxNote), height, 0), 8)
  }
  pop();
}

function mousePressed() {
  if (!audioStart) {
    userStartAudio();
    audioStart = true;
  }

  let ps = new pianoString(mouseX, mouseY)
  ps.strike()
  pianoStrings.push(ps);
}

function keyTyped() {
  if(key === 'e') {
    pianoStrings = [];
  }
}

class pianoString {
  constructor(x, y) {
    this.x = x;
    this.y = y
    this.osc = new p5.Oscillator();
    this.osc.freq(map(this.y, 0, height, 
      midiToFreq(maxNote), 
      midiToFreq(minNote)));
    this.osc.start()
    this.osc.amp(0)
    
    this.env = new p5.Env()
    this.env.setADSR(0.001, 0.1, 0.1, 2)
    //this.env.setExp()
    
    this.amp = new p5.Amplitude();
    this.amp.setInput(this.osc);

    //reverb.process(this.osc, 5, 2)
  }
  
  strike(speed = 100) {
    this.osc.pan(map(this.x, 0, width, -1, 1), 0.1)
    this.env.setRange(map(speed, 0, 100, 0, 1), 0)
    this.env.play(this.osc)
  }

  checkStrike() {
    if (0 > mouseX || mouseX > width) return;

    if((pmouseY < this.y && this.y < mouseY) ||
       (pmouseY > this.y && this.y > mouseY)) {
        this.x = mouseX;
        this.strike(abs(mouseY-pmouseY));
    }
  }
  
  display() {  
    this.checkStrike();

    let lineLevel = map(this.amp.getLevel(), 0, 0.1, 0, 1);
    
    stroke(map(lineLevel, 0, 1, 72, 255))
    
    let vibe = sin(millis()*0.0002*this.osc.getFreq()) * lineLevel * vibeH
    
    line(0, this.y, this.x, this.y + vibe)
    line(this.x, this.y + vibe, width, this.y)
  }
}