let week1a = new p5((s) => {

  let diW = 80;
  let diH = 6;

  let diDen = 2;

  let topColor1, topColor2;
  let botColor1, botColor2;
  let curColor1, curColor2;
  let cirColor1, cirColor2;

  let r1 = 20, r2 = 200;

  let cirNum = 10;

  s.setup = () => {
    var canvas = s.createCanvas(640, 640);
    canvas.mousePressed(s.generate)
    
    topColor1 = s.color('green');
    topColor2 = s.color('mediumblue');
    botColor1 = s.color('yellow');
    botColor2 = s.color('yellowgreen');
    
    cirColor1 = s.color('coral');
    cirColor2 = s.color('gold');

    s.generate();
  }

  s.generate = () => {
    s.background('black');
    
    s.fillGradient();
    
    s.fillCircle();
    
    s.fillDiamonds();
  }

  s.makeDiamond = (x, y, c) =>{
    s.fill(c);
    s.quad(x - diW, y, x, y - diH, x + diW, y, x, y + diH)
  }

  s.fillDiamonds = () => {
    s.noStroke();
    for(let i = 0; i < s.height; i += diDen) {
      curColor1 = s.lerpColor(topColor1, botColor1, i/s.height);
      curColor2 = s.lerpColor(topColor2, botColor2, i/s.height);
      s.makeDiamond(s.random() * s.width, i, s.lerpColor(curColor1, curColor2, s.random()));
    }
  }

  s.fillCircle = () =>{
    s.noStroke();
    for(let i = 0; i <= cirNum; i++) {
      let rr = s.map(s.random(), 0, 1, r1, r2)
      s.fill(s.lerpColor(cirColor1, cirColor2, s.random()))
      s.circle(s.width * s.random(), s.height * s.random(), rr)
    }
  }

  s.fillGradient = () => {
    s.noFill()
    for(let i = 0; i <= s.height; i++) {
      let fillColor = s.lerpColor(topColor1, botColor1, i/s.height)
      s.stroke(fillColor);
      s.line(0, i, s.width, i);
    }
}}, 'p5-frame-1');




let week1b = new p5((s) => {

  let baseDots = 8;
  let maxDist = 640;
  let maxSize = 100;
  let mouSpeed = 1000;
  let rotDist = 100;
  
  let ringNum = 8;
  let mouDist;
  
  let innerCol, outerCol;

  let tmouseX, tmouseY;
  let ptmouseX, ptmouseY;
  let mouseSmooth = 0.2;
  
  
  s.setup = () => {
    s.createCanvas(640, 640);
    mouDist = 0;
  
    innerCol = s.color('plum');
    outerCol = s.color('orangeRed');

    tmouseX = s.mouseX;
    tmouseY = s.mouseY;
  }
  
  s.draw = () => {
    s.background('darkslateblue');
  
    s.noStroke();

    ptmouseX = tmouseX;
    ptmouseY = tmouseY;

    tmouseX = s.constrain(tmouseX + (s.mouseX - tmouseX) * mouseSmooth, 0, s.width);
    tmouseY = s.constrain(tmouseY + (s.mouseY - tmouseY) * mouseSmooth, 0, s.height);

  
    mouDist = mouDist + s.dist(ptmouseX, ptmouseY, tmouseX, tmouseY)/mouSpeed
  
    let dista = maxDist * tmouseX/s.width
    let size  = maxSize * tmouseY/s.height
    
  
    for(let i = ringNum-1; i >= 0; i--) {
      let a = i/ringNum;
      s.drawRingTri(dista*a, size - size*a, baseDots*i, mouDist*a, 
        s.lerpColor(innerCol, outerCol, a));
    }
  }
  
  s.drawRingTri = (dist, size, numDots, angle, color) => {
    for(let i = 0; i < numDots; i++) {
      let mod = s.TWO_PI*i/numDots;
      s.drawTri(dist*s.sin(mod+angle)+s.width/2, 
                dist*s.cos(mod+angle)+s.height/2, 
                size, mod+angle, color)
    }
  }
  
  s.drawTri = (x, y, r, a, c) => {
    let angleOffset = s.max(rotDist-s.dist(tmouseX, tmouseY, x, y), 0)/rotDist
    s.fill(s.lerpColor(c, s.color(255), angleOffset));
    a = a+angleOffset * s.PI
  
    s.triangle(r*s.sin(a)+x,    r*s.cos(a)+y,
      r*s.sin(a+  s.TWO_PI/3)+x,r*s.cos(a+  s.TWO_PI/3)+y,
      r*s.sin(a+2*s.TWO_PI/3)+x,r*s.cos(a+2*s.TWO_PI/3)+y)
  }}, 'p5-frame-2');