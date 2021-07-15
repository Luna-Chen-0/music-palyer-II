//the part of code of drawing fireworks below are adapted from https://cantelope.org/
// the firework blooms whenever a beat appear.
var baseX;
var baseY;
var camZ;
var camX;
var camY;
var camNX;
var camNY;
var camNZ;
var castPoint;
var offset;
var castPointV;
var offsetV;
var scope;
var theTimer;
var castInterval;
var grav;
var buds;
var fireStars;
var meteors;
var frames;
var gAlpha;
var spectrum;

function Fireworks(){
    this.name = "Fireworks";
    this.setup = function(){
        baseX = width/2;
        baseY = height/2;
        camZ = -25;
        camX = camY = camNX = camNY =  camNZ = castPoint = offset = castPointV = offsetV = 0;
        scope = 600;
        theTimer = 0;
        castInterval = 5;
        grav = .02;
        buds = [];
        fireStars = [];
        meteors = [];
        frames = 0;
        for(i  =  1; i <=  10; i++){
            var meteorPic  =  loadImage("assets/meteor"+i+".png");
            fireStars.push(meteorPic);
        }
    }
    this.setup();
    this.onResize = function(){
        baseX = windowWidth/2;
        baseY = windowHeight/2;
    }
    this.onResize();
    this.draw = function(){
        if(frames > 100000){
            theTimer=0;
            frames=0;
        }
        frames ++;
        spectrum = fourier.analyze();
        drawFireworks();
        update();       
    }  
}

//rasterize the x y z of the points
function rasPoint(pointX,pointY,pointZ){
    pointX -= camX;
    pointY -= camY;
    pointZ -=  camZ;
    var vp = atan2(pointX,pointZ);
    var vd = sqrt(pointX*pointX+pointZ*pointZ);
    pointX = sin(vp-offset)*vd;
    pointZ = cos(vp-offset)*vd;
    vp = atan2(pointY,pointZ);
    vd = sqrt(pointY*pointY+pointZ*pointZ);
    pointY = sin(vp-castPoint)*vd;
    pointZ = cos(vp-castPoint)*vd;
    var rpointX1 = -1000;
    var rpointY1 = 1;
    var rpointX2 = 1000;
    var rpointY2 = 1;
    var rpointX3 = 0;
    var rpointY3 = 0;
    var rpointX4 = pointX;
    var rpointY4 = pointZ;
    var nPoint = (rpointY4-rpointY3)*(rpointX2-rpointX1)-(rpointX4-rpointX3)*(rpointY2-rpointY1);
    if(!nPoint){
        return{x: 0,
               y: 0,
               d: -1};
    } 
    var aPoint = ((rpointX4-rpointX3)*(rpointY1-rpointY3)-(rpointY4-rpointY3)*(rpointX1-rpointX3))/nPoint;
    var bPoint = ((rpointX2-rpointX1)*(rpointY1-rpointY3)-(rpointY2-rpointY1)*(rpointX1-rpointX3))/nPoint;
    if(!pointZ){
        pointZ = .000000001;
    }
    if( aPoint > 0 && aPoint < 1 && bPoint > 0&& bPoint<1){
        return {x: baseX + ( rpointX1 + aPoint*(rpointX2 - rpointX1) )*scope,
                y: baseY + pointY/pointZ*scope,
                d: sqrt(pointX*pointX + pointY*pointY + pointZ*pointZ)
            };
    }
    else{
        return{x: baseX + (rpointX1 + aPoint*(rpointX2-rpointX1))*scope,
               y: baseY + pointY/pointZ*scope,
               d: -1
        };
    }
}

// creat buds
function addbuds(){
    var bud = {
        x: -51 + 100 * random(),
        y: 26,
        z: -51 + 100 * random(),
        NX: .11 - .2 * random(),
        NY: -1.6,
        NZ: .11 - .2 * random()
    }
    buds.push(bud);
}

//buds explode to firework
function explode(x, y, z){
    var countT = 5.1 + parseInt( 151 * random() );
    var meteorV = 1.01 + 2.51 * random();
    //creat ranImg to random cases to randomly choose the meteor image
    ranImg = parseInt(3 * random());
    Img1 = parseInt(10 * random());
    do{
        Img2 = parseInt( 10 * random() );
    } 
    while(Img2 == Img1);
    do{ 
        Img2 = parseInt( 10 * random() );}
    while(Img2 == Img1);
    do{ 
        Img3 = parseInt( 10 * random() );
    } 
    while(Img3 == Img1 || Img3==Img2);
    //creat t meteors with the location at the input variable x, y, z
    for(var m=1;  m<countT; m++){
        //push the meteors
        meteor = {x : x,  y : y,  z : z}
        var n1 = TWO_PI * random();
        var n2 = TWO_PI * random();
        var v = meteorV*(1 + random()/5.9)
        meteor.NX = v * sin(n1) * sin(n2);
        meteor.NZ = v * cos(n1) * sin(n2);
        meteor.NY = v *cos(n2);
        //choose the meteor image of each meteor
        if (ranImg == 0){
            meteor.img = fireStars[Img1];
        }
        else if(ranImg == 1){
            meteor.img = fireStars[Img2];
        }
        else if(ranImg == 2){
            meteor.img = fireStars[Img3];
        }
        meteor.radius = random()*49 + 26;
        meteor.trail = [];
        meteor.alpha=1;
        meteors.push(meteor);
    }
}

function update(){
    //add buds
    if(theTimer < frames){
        theTimer = frames + castInterval*random()*10;
        addbuds ();
    }
    // control the move of the buds and the time buds explode
    for(i=0; i < buds.length; i++){
        buds[i].x += buds[i].NX;
        buds[i].y += buds[i].NY;
        buds[i].z += buds[i].NZ;
        buds[i].NY += grav;
    }
    //only there is a beat, the firework explode
    if(beatDect.detectBeat(spectrum))    
       {
           for(i=0; i < buds.length; i++){
                explode(buds[i].x, buds[i].y, buds[i].z);
                buds.splice(i,1);
           }
        }
    
    for(i=0; i < meteors.length; i++){
        if(meteors[i].alpha > 0 && meteors[i].radius > 5){
            meteors[i].alpha -= 0.01;
            meteors[i].radius /= 1.02;
            meteors[i].NY += grav;
            dot={};
            dot.x=meteors[i].x;
            dot.y=meteors[i].y;
            dot.z=meteors[i].z;
            if(meteors[i].trail.length){
                var nx = meteors[i].trail[meteors[i].trail.length-1].x;
                var ny = meteors[i].trail[meteors[i].trail.length-1].y;
                var nz = meteors[i].trail[meteors[i].trail.length-1].z;
                var nd = ((dot.x - nx)*(dot.x - nx)+(dot.y - ny)*(dot.y - ny)+(dot.z - nz)*(dot.z - nz));
                if(nd > 9){
                    meteors[i].trail.push(dot);
                }
            }
            else{
                meteors[i].trail.push(dot);
            }
            if(meteors[i].trail.length > 5){
                meteors[i].trail.splice(0,1);
            }
            meteors[i].x+=meteors[i].NX;
            meteors[i].y+=meteors[i].NY;
            meteors[i].z+=meteors[i].NZ;
            meteors[i].NX /= 1.074;
            meteors[i].NY /= 1.074;
            meteors[i].NZ /= 1.074;
        }
        else{
            meteors.splice(i,1);
        }
    }
    var np = atan2(camX,camZ);
    var nd = sqrt(camX*camX+camZ*camZ);
    nd += sin(frames/80)/1.25;
    var time = sin(frames/200)/40;
    camX = nd * sin(np+time);
    camZ = nd * cos(np+time);
    offset = PI+np+time;
}

function drawFireworks(){
    clear();
    background(0);
    noStroke();
    // control the buds
    gAlpha=255;
    fill(color(255,255,136,gAlpha));
    for( i=0; i< buds.length; i++){
        dot = rasPoint(buds[i].x, buds[i].y, buds[i].z);
        if(dot.d != -1) {
            var theSize = 200/(1+dot.d);
            rect(dot.x-theSize/2,dot.y-theSize/2,theSize,theSize);
        }
    }
    // control the fireworks
    var bloom = false;
    if (bloom == false){
        bloom = true;
    }
    else{
        bloom = false;
    }
    if (bloom){
        var dot1= {};
        for(i=0;i<meteors.length;i++){
        var dot = rasPoint(meteors[i].x,meteors[i].y,meteors[i].z);           
        if(dot.d!=-1){
            theSize = meteors[i].radius*200/(1+dot.d);               
            if(meteors[i].alpha < 0){
                meteors[i].alpha=0;
            }                
            if(meteors[i].trail.length){
                dot1.x=dot.x;
                dot1.y=dot.y;
                //for(j = meteors[i].trail.length-1; j>=0; j--){
                for(var j = 0; j < meteors[i].trail.length; j++){
                    dot2 = rasPoint(meteors[i].trail[j].x,meteors[i].trail[j].y,meteors[i].trail[j].z);
                    if( dot2.d != -1){
                        gAlpha=(j / meteors[i].trail.length * meteors[i].alpha /2)*255;
                        if (meteors[i].img == fireStars[0]){
                            stroke(color(255,136,68,gAlpha));
                        }
                        if (meteors[i].img == fireStars[1]){
                            stroke(color(136,68,255,gAlpha));
                        }
                        if (meteors[i].img == fireStars[2]){
                            stroke(color(136,255,255,gAlpha));
                        }
                        if (meteors[i].img == fireStars[3]){
                            stroke(color(255,255,255,gAlpha));
                        }
                        if (meteors[i].img == fireStars[4]){
                            stroke(color(68,255,136,gAlpha));
                        }
                        if (meteors[i].img == fireStars[5]){
                            stroke(color(255,68,68,gAlpha));
                        }
                        if (meteors[i].img == fireStars[6]){
                            stroke(color(255,136,68,gAlpha));
                        }
                        if (meteors[i].img == fireStars[7]){
                            stroke(color(136,68,255,gAlpha));
                        }
                        if (meteors[i].img == fireStars[8]){
                            stroke(color(255,255,255,gAlpha));
                        }
                        if (meteors[i].img == fireStars[9]){
                            stroke(color(68,68,255,gAlpha));
                        }
                        beginShape();
                        strokeWeight(1+meteors[i].radius*10/(meteors[i].trail.length-j)/(1+dot2.d));
                        line(dot1.x, dot1.y, dot2.x, dot2.y);
                        endShape();
                        dot1.x=dot2.x;
                        dot1.y=dot2.y;
                    }
                }
            }
            //add the image of stars
            noStroke();
            gAlpha=meteors[i].alpha;
            meteors[i].img.width = theSize;
            meteors[i].img.height = theSize;
            image(meteors[i].img,dot.x-theSize/2,dot.y-theSize/2);
            }
        }
    }
}

