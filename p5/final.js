// Rendering settings
let fr = 30;
let blackLevel = 32;
let strW = 2;
let tf;

// Grass blade settings
let grassW = 48;
let grassH = 112;

let xOff = 4;
let yOff = 8;
let widOff = 4;
let heiOff = 8;
let noiOff = 0.5;
let noiDis = 0.25;

// Grass field settings
let overlap = 0.35;
let grassDis;

let maxLayerNum = 5;

let layerScale = 0.8;
let minLayerProb = 0.25;

let grassField;

// Mouse variables
let mSpeedX = 0;
let deceler = 1;

let maxMouDist = 64;
let maxMouSpeed = 48;

let windThresh = 0.025;


function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("p5-frame");

	frameRate(fr);

	tf = new Transformer();

	strokeWeight(strW);
	stroke(64 + blackLevel, 32 + blackLevel, 192 + blackLevel);
	fill(blackLevel);

	drawingContext.shadowColor = color(64, 32, 192);
	drawingContext.shadowBlur = 10;

	grassDis = grassW - (grassW * overlap * 2)

	grassField = new GrassField();
}
  
function draw() {
	background(blackLevel);	

	mSpeedX = constrain((mouseX - pmouseX), -maxMouSpeed, maxMouSpeed);

	grassField.display();
}

function shuffleItems(items) {
	for (let i = items.length - 1; i > 0; i--) {
		const j = floor(random() * (i + 1));
		const temp = items[i];
		items[i] = items[j];
		items[j] = temp;
	}
}



class GrassBlade {
	constructor(xPos) {
		this.xPos = xPos;
		this.xOffset = random(-xOff, xOff);
		this.yOffset = random(-yOff, yOff);
		this.w = grassW + random(-widOff, widOff);
		this.h = grassH + random(-heiOff, heiOff);

		this.noiseSpeed = random(noiOff, 2 * noiOff);
		this.noiseDist = random([-1, 1]) * noiDis/(PI*2);

		this.windOffset = 0;
	}

	display () {
		let windSpeed = constrain((maxMouDist - abs(mouseX - (this.xPos * grassDis + (width / 2))))/maxMouDist, 0, 1) * -mSpeedX/100
		 
		if (abs(windSpeed) > windThresh) {
			this.windOffset += windSpeed;
		}
		else if (this.windOffset > windThresh) {
			this.windOffset -= windThresh;
		} 
		else if (this.windOffset < -windThresh) {
			this.windOffset += windThresh;
		} 
		else {
			this.windOffset = 0;
		}

		tf.push(); {
			tf.translate(this.xPos * grassDis + this.xOffset, 0 + this.yOffset)
			shearX(this.noiseDist * sin((this.noiseSpeed * frameCount/fr) + this.xPos) + this.windOffset)
			triangle(-this.w/2, 0, this.w/2, 0, 0, -this.h)
		} tf.pop();
	}
}



class GrassLayer {
	constructor (grassNum, layerNum) {
		this.grassNum = grassNum;
		this.layerNum = layerNum;
		this.generate();
	}

	generate() {
		this.grass = []

		let prob = 1 - (this.layerNum/maxLayerNum * minLayerProb)
		for(let i = 0; i < this.grassNum; i++) {
			if (random() < prob) {
				this.grass.push(new GrassBlade(i-floor(this.grassNum/2)))
			}
		}
		shuffleItems(this.grass);
	}

	display() {
		this.grass.forEach(grassBlade => {
			grassBlade.display();
		});
	}
}



class GrassField {
	constructor () {
		this.grassLayers = []

		for(let i = 0; i < maxLayerNum; i++) {
			let grassNum = floor((width/pow(layerScale, i)) / (grassDis)) + 2;
			this.grassLayers.push(new GrassLayer(grassNum, i));
		}
	}

	display() {
		tf.translate(width/2, height + grassH/3);
		for(let i = this.grassLayers.length - 1; i >= 0; i--) {
			tf.push(); {
				let scl = pow(layerScale, i)
				tf.scale(scl)
				strokeWeight(strW / scl)

				tf.translate(0, -grassH * 0.7 * i);
				
				this.grassLayers[i].display();
			} tf.pop();
		}
	}
}