var controls = null;
var vis = null;
var fourier;
var beatDect;
var gif = [];
var loadingImg;
var myFont;
var sound;
//the gui control values
var soundControl;
var gui;
//newSoundLoaded is the value to control the drawing of loading image when a new sound is updated by the upload button
var newSoundLoaded = false;
var soundOnChange = false;

function preload(){
    //the gifs for the concert visualisaion
    for (var i =0; i <= 7; i++){
        var g = loadImage("assets/gif"+i+".gif");
        gif.push(g);
    }
    //the font to draw the menu text
    myFont = loadFont("assets/Mona-Free.otf");
    //the loading image when uploading a new sound
    loadingImg = loadImage("assets/loading.gif");
    //the default sound
    sound = loadSound('assets/because_of_you.mp3');
}

//the success callback of uploading a sound
function successBack(){
    alert("Sound is Ready !");
    newSoundLoaded = false; 
}

//the error callback of uploading a sound
function errorBack(err){
    alert("can not load the file:  " + err);
    sound = loadSound('assets/because_of_you.mp3');
    newSoundLoaded = false;
}

//the whileloading callback of uploading a sound
function loading(percent){
    newSoundLoaded = true;
}

function setup(){
    createCanvas(windowWidth, windowHeight);
    clear();
    background(0);
    //the gui object to control the sound
    soundControl = new function(){
        this.Volume = 0.5;
        this.jump = 0;
        this.menu = function(){
            controls.menuDisplayed = !controls.menuDisplayed;
        }
        this.fullScreen = function(){
            let fs = fullscreen();
            fullscreen(!fs);
        }
        this.uploadSong = function(){
            document.getElementById("audiofile").click();
            document.getElementById("audiofile").onchange = function(event){
                if(event.target.files[0]){
                    if(typeof sound != "undefined"){
                        // Catch already playing songs
                        sound.disconnect();
                        sound.stop();
                        controls.playbackButton.playing = false;
                        controls.draw();
                    }
                    // Load our new song
                    sound = loadSound(URL.createObjectURL(event.target.files[0]),successBack,errorBack,loading);
                    
                }
            }
        }
        this.save = function(){
            saveCanvas('mycanvas', 'png');
        }
    }
    gui = new dat.GUI();
    //control the volume of the sound
    gui.add(soundControl,"Volume",0,1);
    //jump the sound to a certain point
    var soundJump = gui.add(soundControl,"jump", 0, sound.duration());
    soundJump.name("Progress Bar");
    soundJump.listen();
    soundJump.onChange(function(){soundOnChange = true});
    soundJump.onFinishChange(function(){
        if(sound.isPlaying() == false){
            sound.jump(soundControl.jump);
            controls.playbackButton.playing = true;
            controls.draw();
        }
        else{
            sound.jump(soundControl.jump);
        }
        
        soundOnChange = false;});
    //control the display of memu
    gui.add(soundControl,"menu").name("Show Menu");
    //full screen
    gui.add(soundControl,"fullScreen").name("Full Screen");
    var newSong = gui.add(soundControl,"uploadSong").name("Upload Sound");
    //save canvas
    gui.add(soundControl, "save").name("Print Screen");
    //create a new visualisation container and add visualisations
    vis = new Visualisations();
    vis.add(new Garland());
    vis.add(new Fireworks());
    vis.add(new Concert());
    vis.add(new Tunnel());
    controls = new ControlsAndInput();
    fourier = new p5.FFT();
    beatDect = new BeatDect();
}

function draw(){
    //change the sound volume and jump to certain point arrcording with the gui
    sound.setVolume(soundControl.Volume);
    if(soundOnChange == false){
        soundControl.jump = sound.currentTime();
    }
    //draw the visualisations
    push();
    clear();
    background(0);
    drawingContext.shadowBlur = 0;
    vis.selectedVisual.draw();
    pop();
    //draw the controls
    push();
    controls.draw();
    //while uploading a sound, draw a sound image
    if(newSoundLoaded){
        controls.menuDisplayed = false;
        image(loadingImg, 0, 0);
    }
    pop();
}

function mouseClicked(){
    controls.mousePressed();
    if(vis.selectedVisual.hasOwnProperty('mouseClicked')){
        vis.selectedVisual.mouseClicked();
    }
}
    
function keyPressed(){
    controls.keyPressed(keyCode);
}

function mousePressed(){
    if(vis.selectedVisual.hasOwnProperty('mousePressed')){
        vis.selectedVisual.mousePressed();
    }
}

function mouseReleased(){
    if(vis.selectedVisual.hasOwnProperty('mouseReleased')){
        vis.selectedVisual.mouseReleased();
    }
}

function mouseDragged(){
    if(vis.selectedVisual.hasOwnProperty('mouseDragged')){
        vis.selectedVisual.mouseDragged();
    }
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    if(vis.selectedVisual.hasOwnProperty('onResize')){
        vis.selectedVisual.onResize();
    }
}