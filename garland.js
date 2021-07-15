var spectrum;
var energy;
var amplitude;
var volume = 0;
var lastVol;
var bass, mid, high, lastHigh;

var noiseStep;
var prog;

var radius = 1;
var angle = 0;
var speed = 2;

var hearts;
var bi;
var triangles;
var shifter = 1;
var angles;


function Garland(){
    this.name = "Garland";
    this.setup = function(){ 
        amplitude = new p5.Amplitude();
        beatDect = new BeatDect();
        bi = new Background2();  
        noiseStep = 0.05;
        prog = 0;
        hearts = [];
        hearts.push(new Heart(width/2, height/2, 10));
        triangles = [];
        angles = [];
    }
    this.setup();
    this.onResize = function(){
        bi.setup();
        bi.addEllipses();
        hearts = [];
        hearts.push(new Heart(width/2, height/2, 10));
        triangles = [];
        angles = [];
        angle = 0;
        radius = 1;
        speed = 2;
    }
    this.onResize();
    this.mouseClicked = function(){
        bi.setup();
        bi.addEllipses();
    }
    this.draw = function(){
        push();
        clear();
        bi.draw();
        drawingContext.shadowBlur = 2;
        spectrum = fourier.analyze();
        energy = fourier.getEnergy("bass");
        volume = amplitude.getLevel();
        bass = fourier.getEnergy('bass')/255;
        mid = fourier.getEnergy('mid')/255;
        high = fourier.getEnergy('highMid')/255;
        if(fourier.getEnergy('highMid') > 120 && random()>0.999){
            bi.setup();
            bi.addEllipses();
        }
        var deltaAngle = speed/radius;
        angle += deltaAngle;
        radius += 60/TWO_PI*deltaAngle;
        if(energy > 0){
            noiseLine(energy);
            for (var i = 0; i < bi.ellips.length; i++){
                bi.ellips[i].radius = map(energy, 0 ,255, 0, (width+height)*0.02);
            }
            for(var i = 0; i < hearts.length; i++){
                hearts[i].draw();
                hearts[i].update(energy);
            }
            for (var i = 0; i < triangles.length; i++){
                triangles[i].draw(volume,mid);
            }
            for (var i = 0; i < angles.length; i++){
                angles[i].draw(volume,mid);
            }
        }
        if(hearts.length/4 < floor((width + height) * 0.03)){
            if(volume - lastVol > 0.02 || high - lastHigh > 0.05){
                if (frameCount % 20 == 0 &&  bi.ellips.length >= 20){
                    bi.ellips.splice(0,1);
                }
                var rnd = floor(random(0, 3));
                var x = width/2+radius*cos(angle);
                var y = height/2+radius*sin(angle);
                if(rnd == 0 && random()>0.5){
                     hearts.push(new Heart(x,y));
                }
                else if (rnd == 1 && random()>0.5){
                    triangles.push(new Triangle(x/2, y/2));
                }
                else if (rnd == 2 && random()>0.5){
                    angles.push(new Angle(x, y));
                }
            }
            if (volume - lastVol < -0.02 ) {
              shifter *= -1;
            }
        }
         lastVol = volume;
         lastHigh = high;
       pop(); 
    }
}

//create a noise line made up of heart shapes
function noiseLine(energy){
    push();
    translate(width/2, height/2);
    noFill();
    stroke(200,200,200,100);
    strokeWeight(3);
    var n = map(energy,0,250,5,50);
    for(var i = 0; i < n; i++){
        var x = map(noise(i*noiseStep + prog + 1000),0, 1, -250,250);
        var y = map(noise(i*noiseStep + prog),0,1, -250,250)
        var h = new Heart(x, y);
        h.draw();
    }
    if (bass > 0.6){
         prog += map(energy, 0, 255, 0, 0.01);
    }
    pop();
}

//create a heart shape
function Heart(x, y){
    this.x = x;
    this.y = y;
    this.size = random(3,10);
    this.draw = function(){
        push();
        beginShape();
        stroke(mid*255,0,0, mid*255);
        strokeWeight(1);
        fill(255,0,0,mid*255);
        vertex(this.x, this.y);
        bezierVertex(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size);
        bezierVertex(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y);
        endShape(CLOSE);
        pop();
    }
    this.update = function(energy){
        var r = map(energy, 0 ,255, 0, (width+height)*0.012);
        this.size = r;
    }
}

//create a polygon shape
function Triangle(x, y) {
  this.x = x + 25;
  this.y = y + 25;
  this.size = random(3,10);
  this.r = 0;
  this.draw = function(){
      angleMode(DEGREES);
      push();
      translate(this.x*2, this.y*2);
      this.r = (this.r + this.size*2*volume*shifter);
      rotate(this.r);
      stroke(volume*200,volume*200,0);
      strokeWeight(mid);
      //fill(mid*255,mid*255,0);
      beginShape();
      vertex(0, 0);
      vertex(this.size, this.size);
      vertex(2*this.size, 2*this.size);
      vertex(3*this.size, this.size);
      vertex(4*this.size, 2*this.size);
      vertex(5*this.size, this.size);
      vertex(6*this.size, 2*this.size);
      vertex(this.size, this.size);
      endShape();
      noStroke();
      pop();
      angleMode(RADIANS);
    }
}

//create an angle shape
function Angle(_x, _y) {
    this.x = _x;
    this.x = _x;
    this.y = _y;
    this.size = random(2,20);
    this.r = random(0,180);
    this.p1 = random(10,20);
    this.p2 = random(10,20);
    this.draw = function(){
        push();
        angleMode(DEGREES);
        stroke(0,0,volume*255, volume*255);
        strokeWeight(bass*2);
        //fill(0,0,mid*255);
        translate(this.x, this.y);
        this.r = (this.r -this.size*2*volume*shifter);
        rotate(this.r);
        beginShape();
        vertex(this.p1, this.p1);
        vertex(this.p2, this.p2);
        vertex(this.p1 + this.p2, this.p2);
        vertex(this.p2, this.p2*2);
        endShape(CLOSE);
        pop();
        noStroke();
        angleMode(RADIANS);
    }
}

//draw the background bubbles
function Background2(){
    this.ellips = [];
    var sizeBase;
    var cw,ch;
    var colour;
    var hueColour;
    var count;
    var c1;
    this.randomNumber = function(min, max){
        return random() * (max - min) + min;
    }
    this.hsla = function(h, s, l, a) {
        return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
    }
    this.setup = function(){
        cw = windowWidth;
        ch = windowHeight;
        sizeBase = cw + ch;
        count = floor(sizeBase * 0.05);
        hueColour = random(0, 360);
        colour = {r1: 1,
                r2: sizeBase * 0.04,
                b1: 10,
                b2: sizeBase * 0.04,
                h1: hueColour,
                h2: hueColour + 100,
                s1: 10,
                s2: 70,
                l1: 10,
                l2: 60,
                a1: 0.1,
                a2: 0.5
            }
        push();
        c1 = createGraphics(cw,ch);
        c1.background(0);
        c1.drawingContext.globalCompositeOperation = 'lighter';
        for(var i = 0; i < count; i++){
            var radius = this.randomNumber(colour.r1, colour.r2),
                blur = this.randomNumber(colour.b1, colour.b2),
                x = random(0, cw),
                y = random(0, ch),
                hueColour = this.randomNumber(colour.h1, colour.h2),
                saturation = this.randomNumber(colour.s1, colour.s2),
                lightness = this.randomNumber(colour.l1, colour.l2),
                alpha = this.randomNumber(colour.a1, colour.a2);
            c1.drawingContext.shadowColor = this.hsla(hueColour, saturation, lightness, alpha);
            c1.drawingContext.shadowBlur = blur;
            c1.noStroke();
            c1.fill(0);
            c1.ellipse(x, y, radius*2);
        }
        pop();
    }
    this.addEllipses=function(){
        this.ellips = [];
        for (var i = 0; i < floor((cw + ch) * 0.03) ; i++) {
            this.ellips.push({radius: this.randomNumber(1, sizeBase * 0.03),
                        x: random(0, cw),
                        y: random(0, ch),
                        angle: this.randomNumber(0, PI*2),
                        //vel: this.randomNumber(0.1, 0.5),
                        vel: this.randomNumber(0.2, 1),
                        tick: this.randomNumber(0, 10000)
            });
        }
    }
    this.setup();
    this.addEllipses();
    this.draw = function(){
        clear();
        drawingContext.globalCompositeOperation = 'source-over';
        drawingContext.shadowBlur = 0;
        image(c1,0,0);
        drawingContext.globalCompositeOperation = 'lighter';
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color('#fff');
        for(var i = 0; i < this.ellips.length; i++) {
            var ellip = this.ellips[i];
            ellip.x += cos(ellip.angle) * ellip.vel;
            ellip.y += sin(ellip.angle) * ellip.vel;
            ellip.angle += this.randomNumber(-0.05, 0.05);
            var c = color(this.hsla(0, 0, 100, 0.075 + cos(ellip.tick * 0.02) * 0.05));
            fill(c);
            noStroke();
            ellipse(ellip.x, ellip.y, ellip.radius*2);
            if (ellip.x - ellip.radius > cw) { 
                ellip.x = -ellip.radius 
            }
            if (ellip.x + ellip.radius < 0) {
                ellip.x = cw + ellip.radius 
            }
            if (ellip.y - ellip.radius > ch) {
                ellip.y = -ellip.radius 
            }
            if (ellip.y + ellip.radius < 0) {
                ellip.y = ch + ellip.radius 
            }
            ellip.tick++;
        }
    }
}


