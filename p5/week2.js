// Inspired by: https://editor.p5js.org/lisajamhoury/sketches/CS5vnqLly

let video;
let lastFrame = [];
let stepSize = 4;

let threshold = 16;
let fRate = 24;

let thresSlider;
let trailSlider;

// Multiply the RGB values to give existing colors a tint
let colMult = [1, 0.25, 0.5, 1]
// background blue-ish color
let colBack = [8, 2, 48]
// boost the brightness of the colors by this amount
let add = 64;
// controls how long trails linger, smaller amounts they linger longer
let trailAlpha = 0.1;


function setup() {
  var canvas = createCanvas(640, 360)
  canvas.parent('p5-frame')
  pixelDensity(1);
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  frameRate(fRate);

  thresSlider = createSlider(8, 128)
  trailSlider = createSlider(0.005, 0.5, 0.01, 0)
  
  noStroke();
  fill(0);

  background(0);
}

function draw() {
  video.loadPixels();

  trailAlpha = trailSlider.value()
  threshold  = thresSlider.value()

  const curFrame = video.pixels;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      // get difference between current frame and last frame per color channel
      const rDiff = abs(curFrame[i]   - lastFrame[i]);
      const gDiff = abs(curFrame[i+1] - lastFrame[i+1]);
      const bDiff = abs(curFrame[i+2] - lastFrame[i+2]);

      // store last frame before messing with the current frame
      lastFrame[i]   = curFrame[i];
      lastFrame[i+1] = curFrame[i+1];
      lastFrame[i+2] = curFrame[i+2];
      lastFrame[i+3] = curFrame[i+3];

      // get average of the difference between color channels
      const avgDiff = (rDiff + gDiff + bDiff) / 3;

      // if the pixel is under the threshold, darken color
      if (avgDiff < threshold && !mouseIsPressed) {
        curFrame[i]   = colBack[0];
        curFrame[i+1] = colBack[1];
        curFrame[i+2] = colBack[2];
        curFrame[i+3] = curFrame[i+3]*trailAlpha;
      }
      // tint current color
      else 
      {
        curFrame[i]   = (curFrame[i+0]+add) * colMult[0];
        curFrame[i+1] = (curFrame[i+1]+add) * colMult[1];
        curFrame[i+2] = (curFrame[i+2]+add) * colMult[2];
        curFrame[i+3] = (curFrame[i+3]+add) * colMult[3];
      }
    }
  }
  // update canvas
  video.updatePixels();
  // flip canvas to mirror webcam
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
}