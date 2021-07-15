//the drawing of the tunnel are inspritated from and some codes are adapted from https://digitalewelt.blaustern.eu/animierter-tunnel-mit-kurven-javascript-canvas/
//the control of colors are adapted from https://css-tricks.com/using-javascript-to-adjust-saturation-and-brightness-of-rgb-colors/
var spectrum;
var w;
var h;
var pixelData;
var data;
var fovControl;
var speed;
var circles;
var rgb;
var rgb2;
var mouseDown;
var mouseAct;
var mousePos;

//the main tunnel constructor
function Tunnel(){
    this.name = "Tunnel";
    this.onResize = function(){
        clear();
        w = windowWidth;
        h = windowHeight;
        pixelData = createImage(width, height);
        pixelData.loadPixels();
        data = pixelData.pixels;
        pixelData.updatePixels();
        image(pixelData, 0, 0);
        init();
    }
    this.onResize();
    this.setup = function(){
        init();
    }
    this.setup();
    this.draw = function(){
        clear();
        background(0);
        clearPixels();
        render();
        pixelData.updatePixels();
        image(pixelData, 0, 0);
    }
    //when mousePressed, change the direction and colour of the tunnel
    this.mousePressed = function(){
         mouseDown = true;
    }
    //when the mouseReleased, redraw the original tunnel
    this.mouseReleased = function(){
        mouseDown = false;
        mouseAct = false;
    }
    //the tunnel can be dragged and change direction with mouse
    this.mouseDragged = function(){
        mouseAct = true;
        mousePos.x = mouseX;
        mousePos.y = mouseY;
    }
}

//set the initial values
function init(){
    mouseAct = false;
    mouseDown = false;
    mousePos = {x:0, y:0};
    fovControl = 250;
    speed = 0.75;
    circles = [];
    time = 0;
    colourInv = 0;
    rgb = {
        r: random() * TWO_PI,
        g: random() * TWO_PI,
        b: random() * TWO_PI   
    };
    rgb2 = {
        r: random() * TWO_PI,
        g: random() * TWO_PI,
        b: random() * TWO_PI
    };
    createCanvas(windowWidth, windowHeight);
    w = width;
    h = height;
    background(0);
    pixelData = createImage(width, height);
    pixelData.loadPixels();
    data = pixelData.pixels;
    addEllips();
}

//get the changing color
function rgbColour(colour) {
  var r = sin(colour.r += 0.010 ) * 1 + 1;
  var g = sin(colour.g += 0.007 ) * 1 + 1;
  var b = sin(colour.b += 0.013 ) * 1 + 1;
  return { r:r, g:g, b:b };
};

function rgbColour2( colour ) {
  var r = sin( colour.r += 0.040 ) * 1 + 1;
  var g = sin( colour.g += 0.028 ) * 1 + 1;
  var b = sin( colour.b += 0.052 ) * 1 + 1;
  return { r:r, g:g, b:b };

};

//control the color in a range
function limitColour(colour, range){
  if ( colour.r < range ) {
    colour.r = range;
  }
  if ( colour.g < range ) {
    colour.g = range;
  }
  if ( colour.b < range ) {
    colour.b = range;
  }
};

//delete all pixel data
function clearPixels() {
    if (data.length > 4){
        for ( var i = 0, l = data.length; i < l; i += 4 ) {
            data[ i ] = 0;
            data[ i + 1 ] = 0;
            data[ i + 2 ] = 0;
            data[ i + 3 ] = 255;
        }
    } 
};

//add the circles according with the sound
function addEllips() {
  var soundMin = 8;
  var soundMax = 1024;
  var soundIndex = soundMin;
  var centerPos = {x:0, y:0 };
  var center  = { x:0, y:0 };
  var tog = 1;
  var index = 0;
  var soundIndex = soundMin;
  var mp = {x:random() * w, y:random() * h };
  for ( var z = -fovControl; z < fovControl; z += 5 ) { 
    var coordinates = drawEllip(centerPos, 75, 64 );
    var circleObj = {};
        circleObj.segsOutside = [];
        circleObj.segsInside = [];
        circleObj.segsInside2 = [];
        circleObj.segsCount = 0;
        circleObj.index = index;
        circleObj.z = z;
        circleObj.center = center;
        circleObj.circleCenter = { x:0, y:0 };
        circleObj.mp = {x:mp.x, y:mp.y };
        circleObj.radius = coordinates[ 0 ].radius;
        circleObj.colour = { r:0, g:0, b:0 };
    tog = index % 2;
    index++;
    if ( z < 0 ) {
      soundIndex++;
    }
    else {
      soundIndex--;
    }
    soundIndex = floor(random() * soundMax) + soundMin;  
    
    var segOutside;
    for ( var i = 0, l = coordinates.length; i < l; i++ ) { 
      var coordinate = coordinates[ i ];
      if ( i % 2 === tog ) {
        segOutside = addEllipsSeg( coordinate.x, coordinate.y, z, soundIndex );
        segOutside.active = true;
        segOutside.index = coordinate.index;
        segOutside.radius = coordinate.radius;
        segOutside.radiusAudio = segOutside.radius;// + random() * 15;
        segOutside.segs = coordinate.segs;
        segOutside.coordinates = [];
        var co;
        if ( i > 0 ) {
          co = coordinates[ i - 1 ];
        } 
        else{
          co = coordinates[ l - 1 ];
        }

        var sub1 = addEllipsSeg( co.x, co.y, z, soundIndex);
        var sub2 = addEllipsSeg(coordinate.x, coordinate.y, z - 5, soundIndex);
        var sub3 = addEllipsSeg(co.x, co.y, z - 5, soundIndex);
        var sub4 = addEllipsSeg( coordinate.x, coordinate.y, z, soundIndex );
        var sub5 = addEllipsSeg( co.x, co.y, z, soundIndex );
        var sub6 = addEllipsSeg( coordinate.x, coordinate.y, z - 5, soundIndex );
        var sub7 = addEllipsSeg( co.x, co.y, z - 5, soundIndex );

        sub1.index = co.index;
        sub2.index = coordinate.index;
        sub3.index = co.index;
        
        sub4.index = coordinate.index;
        sub5.index = co.index;
        sub6.index = coordinate.index;
        sub7.index = co.index;

        segOutside.subs = [];
        segOutside.subs.push( sub1, sub2, sub3, sub4, sub5, sub6, sub7 );
        if ( i < l - 1 ) {
          soundIndex = floor( random() * soundMax ) + soundMin;
        } 
        else{
          soundIndex = circleObj.segsOutside[ 0 ].soundIndex;
        }
        circleObj.segsOutside.push( segOutside);
      } 
    else{
      circleObj.segsOutside.push( { active:false } );
    }
    }
    circles.push( circleObj );
  }
};

//draw a circle
function drawEllip( centerPos, radius, segs ) {
  var coordinates = [];
  var radiusSave;
  var diff = 0;
  for ( var i = 0; i <= segs; i++ ) {
    var radiusRandom = radius;// + ( radius / 8 );
    if ( i === 0 ) {
      radiusSave = radiusRandom;
    }
    if ( i === segs ) {
      radiusRandom = radiusSave;
    }
    var centerX = centerPos.x;
    var centerY = centerPos.y;
    var position = getPos( centerX, centerY, radiusRandom, i, segs );
    coordinates.push( { x:position.x, y:position.y, index:i + diff, radius:radiusRandom, segs:segs } );
  }
  return coordinates;
};

//the circle segment
function addEllipsSeg( x, y, z, soundIndex ) {
  var circleseg = {};
      circleseg.x = x;
      circleseg.y = y;
      circleseg.x2d = 0;
      circleseg.y2d = 0;
      circleseg.soundIndex = soundIndex;
  return circleseg;
};

//control the position
function getPos( centerX, centerY, radius, index, segs ) {
  var angle = index * ( TWO_PI / segs ) + time;
  var x = centerX + cos( angle ) * radius;
  var y = centerY + sin( angle ) * radius;
  return { x:x, y:y };
};

function setPixel( x, y, r, g, b, a ) {
    var i = ( x + y * pixelData.width ) * 4;
    data[ i ] = r;
    data[ i + 1 ] = g;
    data[ i + 2 ] = b;
    data[ i + 3 ] = a;
};

//draw lines of the tunnel
function drawLine( x1, y1, x2, y2, r, g, b, a ) {
  var dx = abs( x2 - x1 );
  var dy = abs( y2 - y1 );
  var sx = ( x1 < x2 ) ? 1 : -1;
  var sy = ( y1 < y2 ) ? 1 : -1;
  var err = dx - dy;
  var lx = x1;
  var ly = y1;    
  while (true){
    if ( lx > 0 && lx < w && ly > 0 && ly < h ) {
      setPixel( lx, ly, r, g, b, a );
    }
    if ( ( lx === x2 ) && ( ly === y2 ) )
      break;
    var e2 = 2 * err;
    if ( e2 > -dx ) { 
      err -= dy; 
      lx += sx; 
    }
    if ( e2 < dy ) { 
      err += dx; 
      ly += sy; 
    }
  }
};

//get more softer color chagne
function softInvert( value ) {
  for ( var j = 0, n = data.length; j < n; j += 4 ) {
    //red
    data[ j ] = abs( value - data[ j ] );
    //green
    data[ j + 1 ] = abs( value - data[ j + 1 ] );
    //blue
    data[ j + 2 ] = abs( value - data[ j + 2 ] );
    //alpha
    data[ j + 3 ] = 255;
  }

};

//the main draw function part of the tunnel
function render() {
  //set the analuze of the music
  spectrum = fourier.analyze();
  var aa = false;
  if ( spectrum ) {
    aa = true;
  }
  var sortArray = false;
  var col = rgbColour2( rgb );
  var col2 = rgbColour( rgb2 );
  limitColour( col, 0.45 );
  limitColour( col2, 0.25 );
  for ( var i = 0, l = circles.length; i < l; i++ ){
    var circleObj = circles[ i ];
    circleObj.colour.r = col.r - ( circleObj.z + fovControl ) / fovControl;
    circleObj.colour.g = col.g - ( circleObj.z + fovControl ) / fovControl;
    circleObj.colour.b = col.b - ( circleObj.z + fovControl ) / fovControl;
    if ( circleObj.colour.r < col2.r ) {
      circleObj.colour.r = col2.r;
    }
    if ( circleObj.colour.g < col2.g ) {
      circleObj.colour.g = col2.g;
    }
    if ( circleObj.colour.b < col2.b ) {
      circleObj.colour.b = col2.b;
    }
    var circleObjBack;
    if ( i > 0 ) {
      circleObjBack = circles[ i - 1 ];
    }
      
    if (mouseAct){
      circleObj.mp = mousePos;
    }
    else{
      circleObj.mp.x += ( ( w / 2 ) - circleObj.mp.x ) * 0.00025;
      circleObj.mp.y += ( ( h / 2 ) - circleObj.mp.y ) * 0.00025;
    } 
    circleObj.center.x = ( ( w / 2 ) - circleObj.mp.x ) * ( ( circleObj.z - fovControl ) / 500 ) + w / 2;
    circleObj.center.y = ( ( h / 2 ) - circleObj.mp.y ) * ( ( circleObj.z - fovControl ) / 500 ) + h / 2;

    for(var j = 0, k = circleObj.segsOutside.length; j < k; j++){
      var segOutside = circleObj.segsOutside[ j ];
      if (segOutside.active === true){
        var scale = fovControl/(fovControl + circleObj.z ); 
        var scaleBack;
        if (i > 0){
          scaleBack = fovControl / ( fovControl + circleObjBack.z ); 
        }
        var frequency, frequencyAdd;
        segOutside.x2d = ( segOutside.x * scale ) + circleObj.center.x;
        segOutside.y2d = ( segOutside.y * scale ) + circleObj.center.y;
        //if the music is playing, chagne the circle segment outhside
        if ( aa === true ) {
          frequency = spectrum[segOutside.soundIndex];
          frequencyAdd = frequency / 20;
          segOutside.radiusAudio = segOutside.radius - frequencyAdd;
        } 
        var linecolourValue = 0;
        if ( j > 0 ) {
          if ( aa === true && sound.paused === false ) {
            linecolourValue = round( i / l * ( 55 + frequency ) );
            if ( linecolourValue > 255 ) {
              linecolourValue = 255;
            }
          } 
        else{
            linecolourValue = round( i / l * 200 );//255 
          }
        }
        if ( i > 0 && i < l - 1 ) {
        var sub1 = segOutside.subs[ 0 ];
            var sub1angle = sub1.index * ( TWO_PI / segOutside.segs ) + time;
            sub1.x2d = ( sub1.x * scale ) + circleObj.center.x;
            sub1.y2d = ( sub1.y * scale ) + circleObj.center.y;
            sub1.x = circleObj.circleCenter.x + cos( sub1angle ) * segOutside.radiusAudio;
            sub1.y = circleObj.circleCenter.y + sin( sub1angle ) * segOutside.radiusAudio;
        var sub2 = segOutside.subs[ 1 ];
         	var sub2angle = sub2.index * ( TWO_PI / segOutside.segs ) + time;
            sub2.x2d = ( sub2.x * scaleBack ) + circleObjBack.center.x;
            sub2.y2d = ( sub2.y * scaleBack ) + circleObjBack.center.y;
            sub2.x = circleObj.circleCenter.x + cos( sub2angle ) * segOutside.radiusAudio;
            sub2.y = circleObj.circleCenter.y + sin( sub2angle ) * segOutside.radiusAudio;
        var sub3 = segOutside.subs[ 2 ];
            var sub3angle = sub3.index * ( TWO_PI / segOutside.segs ) + time;
            sub3.x2d = ( sub3.x * scaleBack ) + circleObjBack.center.x;
            sub3.y2d = ( sub3.y * scaleBack ) + circleObjBack.center.y;
            sub3.x = circleObj.circleCenter.x + cos( sub3angle ) * segOutside.radiusAudio;
            sub3.y = circleObj.circleCenter.y + sin( sub3angle ) * segOutside.radiusAudio;
        var sub4 = segOutside.subs[ 3 ];
         	var sub4angle = sub4.index * ( TWO_PI / segOutside.segs ) + time;
            sub4.x2d = ( sub4.x * scale ) + circleObj.center.x;
            sub4.y2d = ( sub4.y * scale ) + circleObj.center.y;
            sub4.x = circleObj.circleCenter.x + cos( sub4angle ) * segOutside.radius;
            sub4.y = circleObj.circleCenter.y + sin( sub4angle ) * segOutside.radius;
        var sub5 = segOutside.subs[ 4 ];
         	var sub5angle = sub5.index * ( TWO_PI / segOutside.segs ) + time;
            sub5.x2d = ( sub5.x * scale ) + circleObj.center.x;
            sub5.y2d = ( sub5.y * scale ) + circleObj.center.y;
            sub5.x = circleObj.circleCenter.x + cos( sub5angle ) * segOutside.radius;
            sub5.y = circleObj.circleCenter.y + sin( sub5angle ) * segOutside.radius;  
         var sub6 = segOutside.subs[ 5 ];
            var sub6angle = sub6.index * ( TWO_PI / segOutside.segs ) + time;
            sub6.x2d = ( sub6.x * scaleBack )+circleObjBack.center.x;
            sub6.y2d = ( sub6.y * scaleBack ) + circleObjBack.center.y;
            sub6.x = circleObj.circleCenter.x + cos( sub6angle ) * segOutside.radius;
            sub6.y = circleObj.circleCenter.y + sin( sub6angle ) * segOutside.radius; 
         var sub7 = segOutside.subs[ 6 ];
            var sub7angle = sub7.index * ( TWO_PI / segOutside.segs ) + time;
            sub7.x2d = ( sub7.x * scaleBack ) + circleObjBack.center.x;
            sub7.y2d = ( sub7.y * scaleBack ) + circleObjBack.center.y;
            sub7.x = circleObj.circleCenter.x + cos( sub7angle ) * segOutside.radius;
            sub7.y = circleObj.circleCenter.y + sin( sub7angle ) * segOutside.radius;
          var p1;
          var p2;
          var p3;
          var p4;
          var p5 = segOutside.subs[ 3 ];
          var p6 = segOutside.subs[ 4 ];
          var p7 = segOutside.subs[ 6 ];
          var p8 = segOutside.subs[ 5 ];
          if ( frequencyAdd > 0 ) {
            p1 = segOutside;
            p2 = segOutside.subs[ 1 ];
            p3 = segOutside.subs[ 2 ];
            p4 = segOutside.subs[ 0 ];
          }
          var cr = round( circleObj.colour.r * linecolourValue );
          var cg = round( circleObj.colour.g * linecolourValue );
          var cb = round( circleObj.colour.b * linecolourValue );
          if ( frequencyAdd > 0 ) {
            drawLine( p1.x2d | 0, p1.y2d | 0, p2.x2d | 0, p2.y2d | 0, cr, cg, cb, 255 );
            drawLine( p2.x2d | 0, p2.y2d | 0, p3.x2d | 0, p3.y2d | 0, cr, cg, cb, 255 );
            drawLine( p3.x2d | 0, p3.y2d | 0, p4.x2d | 0, p4.y2d | 0, cr, cg, cb, 255 );
            drawLine( p4.x2d | 0, p4.y2d | 0, p1.x2d | 0, p1.y2d | 0, cr, cg, cb, 255 );
            drawLine( p5.x2d | 0, p5.y2d | 0, p1.x2d | 0, p1.y2d | 0, cr, cg, cb, 255 );
            drawLine( p6.x2d | 0, p6.y2d | 0, p4.x2d | 0, p4.y2d | 0, cr, cg, cb, 255 );
            drawLine( p7.x2d | 0, p7.y2d | 0, p3.x2d | 0, p3.y2d | 0, cr, cg, cb, 255 );
            drawLine( p8.x2d | 0, p8.y2d | 0, p2.x2d | 0, p2.y2d | 0, cr, cg, cb, 255 );
          }
          if ( circleObj.z < fovControl / 2 ) {
            drawLine( p5.x2d | 0, p5.y2d | 0, p6.x2d | 0, p6.y2d | 0, cr, cg, cb, 200 );
            drawLine( p6.x2d | 0, p6.y2d | 0, p7.x2d | 0, p7.y2d | 0, cr, cg, cb, 200 );
            drawLine( p7.x2d | 0, p7.y2d | 0, p8.x2d | 0, p8.y2d | 0, cr, cg, cb, 200 );
            drawLine( p8.x2d | 0, p8.y2d | 0, p5.x2d | 0, p5.y2d | 0, cr, cg, cb, 200 );
          }
        }
        var segOutsideangle;
        segOutsideangle = segOutside.index * ( TWO_PI / segOutside.segs ) + time;
          segOutside.x = circleObj.circleCenter.x + cos( segOutsideangle ) * segOutside.radiusAudio;
          segOutside.y = circleObj.circleCenter.y + sin( segOutsideangle ) * segOutside.radiusAudio;
      }
    }
    if ( mouseDown ) {
      circleObj.z += speed;
      if ( circleObj.z > fovControl ) {
        circleObj.z -= ( fovControl * 2 );
        sortArray = true;
      }
    } 
    else{
      circleObj.z -= speed;
      if ( circleObj.z < -fovControl ) {
        circleObj.z += ( fovControl * 2 );
        sortArray = true;
      }
    }
  }
  if ( sortArray){
    circles = circles.sort( function( a, b ) {
      return ( b.z - a.z );
    } );
  }
  if ( mouseDown ) {
    time -= 0.005;
  } 
  else{
    time += 0.005;
  }
  //soft invert colours
  if ( mouseDown ) {
    if ( colourInv < 255 )
      colourInv += 5;
    else
      colourInv = 255;
    softInvert(colourInv);
  } 
    else {
    if ( colourInv > 0 )
      colourInv -= 5;
    else
      colourInv = 0;
    if ( colourInv > 0 )
      softInvert( colourInv );
  }
};





