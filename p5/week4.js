// Chord Generator by Harrison Kurtz
// Click to strum a new chord!

// The current key is displayed in the background.


// Generates chord tones via the overtone series
// giving a greater chance of root notes and fifths, etc...
let degreeProbablity = 
  [0, 0, 0, 0, 0, 1, 2, 2, 
   3, 4, 4, 4, 5, 6]; 
// Degrees are indicies for the scale array.
let scale = [0, 2, 4, 5, 7, 9, 10]
let noteNames = 
  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// The next chord's root scale note is 
// chosen randomly from the previous chord.
let baseNote = 0;
let nextBaseNote = 0;
let voices = 5;

// Holds alive notes
let notes = [];

let minNote = 24;
let maxNote = 96;

let maxLifespan = 2500;
let attackTime = 50;

let startAudio = false;

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("p5-frame");
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(24);

  // Draws root note in the background
  push();
  {
    textSize(height);
    fill(12);
    text(noteNames[baseNote], width/2, height/2)
  }
  pop();

  for(let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];
    note.update();
    if(note.isDead()) {
      note.stop();
      notes.splice(i, 1);
    }
  }
}

function strumChord() {
  let chordTones = [];

  let root = minNote + nextBaseNote;
  for(let i = 0; i < voices; i++) {
    let newNote = root + scale[random(degreeProbablity)] 
    chordTones.push(newNote) // saves chord tones to choose the next root
    sleep(100*i).then(function() { notes.push(new Note(newNote))});
    root += 12; // moves up an octave
  }
  baseNote = nextBaseNote;
  nextBaseNote = random(chordTones) % 12;
}

// Taken from https://editor.p5js.org/RemyDekor/sketches/9jcxFGdHS
function sleep(millisecondsDuration){
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

function mousePressed() {
  if(!startAudio) {
    userStartAudio();
    startAudio = true;
  }
  strumChord();
}

class Note {
  constructor(note) {
    this.name = noteNames[note % 12];

    this.osc = new p5.Oscillator("triangle");
    this.osc.freq(midiToFreq(note));
    this.osc.amp(0.1);
    this.osc.start();

    this.env = new p5.Envelope(attackTime/1000, 0.1, (maxLifespan - attackTime)/1000, 0);
    this.env.play(this.osc);

    this.lifespan = maxLifespan;

    this.dir = random([-1, 1]);

    this.acc = createVector(0, 0);
    this.vel = createVector(this.dir * random(2.5, 7.5), 0);

    let xPos = -64
    if(this.dir == -1){ xPos = width - xPos; }
    this.pos = createVector(xPos, map(note, minNote - 6, maxNote + 5, height, 0));
  }

  stop() {
    this.osc.stop();
  }

  update() {
    this.move();
    this.display();

    this.lifespan -= deltaTime;

    this.osc.pan(map(this.pos.x, 0, width, -1, 1));
    //this.osc.amp(map(this.lifespan, 0, maxLifespan, 0, 0.1));
    
  }

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.acc = p5.Vector.mult(this.vel, -0.01)
  }

  display() {
    fill(map(this.lifespan, 0, maxLifespan, 0, 255));
    textSize(map(this.lifespan, 0, maxLifespan, 24, 32))
    text(this.name, this.pos.x, this.pos.y)
    //circle(this.pos.x, this.pos.y, 20);
  }

  isDead() {
    return this.lifespan < 0;
  }
}