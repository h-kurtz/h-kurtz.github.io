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

// Grass spring settings
let gMass = 100;
let gK = 0.25;
let gDamp = 0.98;

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

// Tree variables
let treeGrowthTime = 2 * fr
let treeHeight = 64

let treeTaper = 0.25;
let treeWidth = 64;
let minWidth = 10;

let maxTilt = 0.5;
let breakProb = 0.15;


function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("p5-frame");

	frameRate(fr);

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

		this.vel = 0.0;
		this.accel = 0;
		this.force = 0;
	}

	display () {
		let windSpeed = constrain((maxMouDist - abs(mouseX - (this.xPos * grassDis + (width / 2))))/maxMouDist, 0, 0.5) * -mSpeedX/100;

		this.force = -gK * this.windOffset
		this.accel = this.force / gMass;
		this.vel = gDamp * (this.vel + this.accel + windSpeed);
		this.windOffset = this.windOffset + this.vel;

		push(); {
			translate(this.xPos * grassDis + this.xOffset, 0 + this.yOffset)
			shearX(this.noiseDist * sin((this.noiseSpeed * frameCount/fr) + this.xPos)+ this.windOffset)
			triangle(-this.w/2, 0, this.w/2, 0, 0, -this.h)
		} pop();
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
		this.trees = []

		for(let i = 0; i < maxLayerNum; i++) {
			let grassNum = floor((width/pow(layerScale, i)) / (grassDis)) + 2;
			this.grassLayers.push(new GrassLayer(grassNum, i));

			let treeX = random(-width/2, width/2)
			this.trees.push(new TreeComp(createVector(treeX - treeWidth/2, 0), 
										 createVector(treeX + treeWidth/2, 0),
										 random(-maxTilt, maxTilt),
										 treeGrowthTime * random(0.5, 2)))
		}

		 
	}

	display() {
		translate(width/2, height + grassH/3);

		for(let i = this.grassLayers.length - 1; i >= 0; i--) {
			push(); {
				let scl = pow(layerScale, i)
				scale(scl)
				strokeWeight(strW / scl)

				translate(0, -grassH * 0.7 * i);
				
				this.trees[i].display();
				this.grassLayers[i].display();
			} pop();
		}

		
	}
}

class TreeComp {
	constructor(baseP1, baseP2, tilt, growthTime, distance = -1) {
		this.startTime = frameCount
		this.growthTime = growthTime;
		this.finishedGrowth = false;

		this.baseP1 = baseP1.copy();
		this.baseP2 = baseP2.copy();

		this.tilt = tilt;

		this.initGrowPoints(distance);

		this.childComp = null;
		this.leftBreak = null;
		this.rightBreak = null;
	}

	initGrowPoints (distance = -1) {
		this.dist = this.baseP1.dist(this.baseP2)
		this.canHaveChild = this.dist > 10;

		this.topTarP1 = createVector(this.baseP1.x + ((this.dist/2)*(treeTaper + this.tilt)), this.baseP1.y-treeHeight)
		this.topTarP2 = createVector(this.baseP2.x - ((this.dist/2)*(treeTaper - this.tilt)), this.baseP2.y-treeHeight)

		this.topP1 = this.baseP1.copy();
		this.topP2 = this.baseP2.copy();
	}

	display() {
		if(!this.finishedGrowth) {
			let growthRatio = (frameCount - this.startTime) / this.growthTime;
			
			this.grow(growthRatio);

			if(growthRatio >= 1) {
				this.finishedGrowth = true;
				if(this.canHaveChild) {
					this.createChild();
				}
			}
		}

		push(); {
			stroke(96 + blackLevel, 32 + blackLevel, 96 + blackLevel);
			this.show();
		

			if (this.childComp != null) {
				this.childComp.display();
			}
			
			if(this.leftBreak != null) {
				this.leftBreak.display();
			}

			if(this.rightBreak != null) {
				this.rightBreak.display();
			}  
		} pop();
	}
	createChild() {
		//console.log("creating child")
		this.childComp = new TreeComp(this.topP1, this.topP2, this.tilt * random(0.5, 2), this.growthTime)
		
		if(random() < breakProb) {
			this.rightBreak = new TreeBreak(this.baseP2, this.topP2, abs(this.tilt * random(1.5, 3))+ 0.5, this.growthTime, this.dist)
		}
		if(random() < breakProb) {
			this.leftBreak = new TreeBreak(this.baseP1, this.topP1, -abs(this.tilt * random(1.5, 3)) - 0.5, this.growthTime, this.dist)
		}
	}

	show() {
		quad(this.baseP1.x, this.baseP1.y,

			this.topP1.x,  this.topP1.y,
			this.topP2.x,  this.topP2.y,
			this.baseP2.x, this.baseP2.y)
	}

	grow(growthRatio) {
		p5.Vector.lerp(this.baseP1, this.topTarP1, growthRatio, this.topP1)
		p5.Vector.lerp(this.baseP2, this.topTarP2, growthRatio, this.topP2)
	}
}

class TreeBreak extends TreeComp {
	constructor(baseP1, baseP2, tilt, growthTime, dist) {
		super(baseP1, baseP2, tilt, growthTime, dist)
	}
	initGrowPoints(distance) {
		let distOffset = distance - (distance * treeTaper*2);
		if(this.tilt < 0) {
			distOffset = -distOffset
		}
		this.canHaveChild = true;

		this.topTar = createVector(this.baseP2.x + distOffset, this.baseP2.y)

		this.top = this.baseP2.copy();
	}
	show() {
		triangle(this.baseP1.x, this.baseP1.y,
				this.baseP2.x, this.baseP2.y,
				this.top.x, this.top.y)
	}

	grow(growthRatio) {
		p5.Vector.lerp(this.baseP2, this.topTar, growthRatio, this.top)
	}
	createChild() {
		//console.log("create child from break")
		if(this.tilt > 0) {
			this.childComp = new TreeComp(this.baseP2, this.top, this.tilt * random(0.5, 2), this.growthTime)
		} else {
			this.childComp = new TreeComp(this.top, this.baseP2, this.tilt * random(0.5, 2), this.growthTime)
		}
	}
}