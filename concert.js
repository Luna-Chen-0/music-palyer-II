function Concert(){
    this.name = "Concert";
    var margin =10;
    this.gif = [];
    this.framebass = 0;
    this.frameLow = 0;
    this.frameterbel = 0;
    this.frameHigh = 0;
    this.framebass2 = 0;
    this.framebass3 = 0;
    this.setup = function(){
        this.gif = gif;
        this.plotwidth = displayWidth*0.9;
        this.plotHeight = displayHeight*0.7;
        this.gif[0].resize(this.plotwidth/5, this.plotHeight/2.5);
        this.gif[1].resize(this.plotwidth/5, this.plotHeight-this.gif[0].height);
        this.gif[2].resize(this.plotwidth*0.4, this.plotHeight*2/3);
        this.gif[3].resize(this.gif[2].width, this.gif[2].height);
        this.gif[4].resize(this.plotwidth*0.8/4, this.plotHeight/3);
        this.gif[5].resize(this.gif[4].width, this.gif[4].height);
        this.gif[6].resize(this.gif[4].width, this.gif[4].height);
        this.gif[7].resize(this.gif[4].width, this.gif[4].height);
        drawBack = new Background1();
    }  
    this.setup();
    this.onResize = function(){
        clear();
        drawBack.setup();
        drawBack.addEllipses();
        this.pad = windowWidth/20;
        this.beginWidth = this.pad;
        this.beginHeight = this.pad;
        this.endWidth = width-this.pad;
        this.endHeight = windowHeight -this.pad;    
    }
    this.onResize();
     this.mouseClicked = function(){
        drawBack.setup();
        drawBack.addEllipses();
    }
    this.draw = function(){
        clear();
        push();
        drawBack.draw();
        drawingContext.shadowBlur = 0;
        image(this.gif[0],this.beginWidth,this.beginHeight);
        image(this.gif[1],this.beginWidth, this.beginHeight+this.gif[0].height+margin);
        image(this.gif[2], this.beginWidth+this.gif[1].width+margin, this.beginHeight);
        image(this.gif[3], this.beginWidth+this.gif[0].width+margin*2+this.gif[2].width, this.beginHeight);
        image(this.gif[4], 
              this.beginWidth+this.gif[1].width+margin, 
              this.beginHeight+this.gif[2].height+margin/2);
         image(this.gif[5],  this.beginWidth+this.gif[1].width+margin+this.gif[4].width+margin/2, 
              this.beginHeight+this.gif[2].height+margin/2);
        image(this.gif[6], 
              this.beginWidth+this.gif[1].width+margin+this.gif[4].width+margin/2+this.gif[5].width+margin/2, 
              this.beginHeight+this.gif[2].height+margin/2);
         image(this.gif[7], 
               this.beginWidth+this.gif[1].width+margin+this.gif[4].width+margin/2+this.gif[5].width+margin/2+this.gif[6].width+margin/2, this.beginHeight+this.gif[2].height+margin/2);
        for (var i=0; i < this.gif.length; i++)
            {
                this.gif[i].pause();
            }
        var spectrum = fourier.analyze();
        this.frequencyBins = ["bass", "lowMid", "highMid", "treble"];
        var bass = fourier.getEnergy(this.frequencyBins[0]);
        var lowmid = fourier.getEnergy(this.frequencyBins[1]);
        var highmid = fourier.getEnergy(this.frequencyBins[2]);
        var terble = fourier.getEnergy(this.frequencyBins[3]);
        //change the light with beat
        var r = map(bass, 0 ,255, 0, (width+height)*0.01);
        for (var i = 0; i < drawBack.ellips.length; i++){
             drawBack.ellips[i].radius = r;
        }
        if(fourier.getEnergy('highMid') > 120 && random()>0.999){
            bi.setup();
            bi.addEllipses();
        }
        //bass ellip
        this.framebass += map(bass,0,255, 0, 0.16);
        var frameBa = floor(this.framebass);
        if (frameBa>this.gif[2].numFrames()-1){
            this.framebass = 0;
            frameBa = 0;
        }
        this.gif[2].setFrame(frameBa);
        this.gif[7].setFrame(frameBa);
        this.framebass3 += map(bass,0, 255, 0, 0.2);
        var frameBa_3 = floor(this.framebass3);
        if(beatDect.detectBeat(spectrum)){
            if(frameBa>this.gif[3].numFrames()){
                this.framebass3 = 0;
                frameBa_3 = 0;
            }
        }
        else{
            if(frameBa_3 >= floor((this.gif[3].numFrames())*random(0.4,1))){
                this.framebass3 = 0;
                frameBa_3 = 0;
            }
        }
        this.gif[3].setFrame(frameBa_3);
        this.framebass2 += map(bass,0,255, 0, 0.2);
        var frameBa2 = floor(this.framebass2);
        if(frameBa2 > 6){
            frameBa2 = 0;
            this.framebass2 = 0;
        }
        this.gif[4].setFrame(frameBa2);
        //lowMid ellip
        this.frameLow += map(lowmid,0,255, 0 , 0.2);
        var frameLow = floor(this.frameLow)
        if (frameLow > this.gif[0].numFrames()-1){
            this.frameLow = 0;
            frameLow = 0;
        }
        this.gif[0].setFrame(frameLow);
        this.gif[5].setFrame(frameLow);
        //high mid ellip
        this.frameHigh += map(highmid,0,255,0,0.2);
        var frameHi = floor(this.frameHigh);
        if (frameHi>this.gif[6].numFrames()-1){
            this.frameHigh = 0;
            frameHi = 0;
        }
        this.gif[6].setFrame(frameHi);
        // terble ellip
        this.frameterbel += map(terble,0,255,0,1);
        var frameter = floor(this.frameterbel);
        if (frameter > this.gif[1].numFrames()-1 ){
            this.frameterbel = 0;
            frameter = 0;
        }
        this.gif[1].setFrame(frameter); 
        //pop();
    }
}

function Background1(){
    this.ellips = [];
    var sizeBase;
    var cw,ch;
    var colour;
    var hueColour;
    var num;
    var graphic;
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
        num = floor(sizeBase * 0.1);
        hueColour = random(0, 360);
        colour = {r1: 1,
                r2: sizeBase * 0.04,
                b1: 10,
                b2: sizeBase * 0.04,
                h1: hueColour,
                h2: hueColour + 100,
                s1: 1,
                s2: 70,
                l1: 5,
                l2: 30,
                a1: 0.1,
                a2: 0.5
            }
        push();
        graphic = createGraphics(cw,ch);
        graphic.background(0);
        graphic.drawingContext.globalCompositeOperation = 'lighter';
        for(var i = 0; i < num; i++){
            var radius = this.randomNumber(colour.r1, colour.r2),
                blur = this.randomNumber(colour.b1, colour.b2),
                x = random(0, cw),
                y = random(0, ch),
                hueColour = this.randomNumber(colour.h1, colour.h2),
                saturation = this.randomNumber(colour.s1, colour.s2),
                lightness = this.randomNumber(colour.l1, colour.l2),
                alpha = this.randomNumber(colour.a1, colour.a2);
            graphic.drawingContext.shadowColor = this.hsla(hueColour, saturation, lightness, alpha);
            graphic.drawingContext.shadowBlur = blur;
            graphic.noStroke();
            graphic.fill(0);
            graphic.ellipse(x, y, radius*2);
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
        image(graphic,0,0);
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
