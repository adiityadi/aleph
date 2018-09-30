const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const midi = require("./midi.js");
const fs = require("fs");

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "", amplitude, leftVol, rightVol, leftVolEased = .001, rightVolEased = .001, volEased = .001;
let assets = {models: {}, textures: {}};
let audio = {};
// set up initial values for audioParams object
let audioParams = {0: 1, 1: 1, 2: 1, 3: 1, 4: .45, 5: 0.25};

// p5.disableFriendlyErrors = true;

function preload() {
	importer("models");
	importer("textures");
}

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	// var gl = document.getElementById('defaultCanvas0').getContext('webgl');
	// gl.disable(gl.DEPTH_TEST);

	input = new p5.AudioIn();
	input.start();
	
	amplitude = new p5.Amplitude();
	amplitude.setInput(input);

	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	analyzeAudio();

	console.log(audioParams);

	if (moduleName !== ""){
		try {
			let moduleFile = require(`./../sketches/${moduleName}.js`);
			moduleFile.run(audio, midi.controls, assets);
		} 

		catch (err){
			console.error(err);
		}
	}
}

function analyzeAudio(){
	volume = amplitude.getLevel() * audioParams[0];
	leftVol = amplitude.getLevel(0);
	rightVol = amplitude.getLevel(1);
	spectrum = fft.analyze();
	waveform = fft.waveform();
	bass = fft.getEnergy("bass") * audioParams[1];
	mid = fft.getEnergy("mid") * audioParams[2];
	high = fft.getEnergy("treble") * audioParams[3];
	fft.smooth(audioParams[4]);
	spectralCentroid = fft.getCentroid();
	smoother(volume, leftVol, rightVol, audioParams[5]);
	audio = {
		fft, volume, leftVol, rightVol, spectrum, waveform, 
		bass, mid, high, spectralCentroid, 
		volEased, leftVolEased, rightVolEased
	};
}

ipc.on("sketchSelector", (event, arg) => {
	resetStyles();
	moduleName = arg;
});

ipc.on("knobChanged", (event, arg) => {
	audioParams = arg;
});

// resize canvas if window is resized
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	centerCanvas();
	background(0);
}

// re-center canvas if the window is resized
function centerCanvas() {
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	canvas.position(x, y);
}

function nearestPow2(value){
  return Math.pow(2, Math.round(Math.log(value)/Math.log(2))); 
}

function importer(folder){
	fs.readdir(`./aleph_modules/assets/${folder}`, (err, files) => {
		if (err){
			console.log(err);
		} else {
			files.forEach((file, index) => {
				// get file name
				let name = file.substring(0, file.length-4);
				// check which folder we're importing from 
				if (folder === "models"){
					// create entry on assets object & load file
					assets.models[name] = loadModel(`../assets/models/${file}`, true);
				}
				if (folder === "textures"){
					assets.textures[name] = loadImage(`../assets/textures/${file}`, true);
				} 
			});
		}
	});
}

function smoother(volume, leftVol, rightVol, easing){
	let scaler = 0.1;

	let target = volume * scaler;
	let diff = target - volEased;
	volEased += diff * easing;

	let targetL = leftVol * scaler;
	let diffL = targetL - leftVolEased;
	leftVolEased += diffL * easing;

	let targetR = rightVol * scaler;
	let diffR = targetR - rightVolEased;
	rightVolEased += diffR * easing;
}

function resetStyles(){
	strokeWeight(1);
	stroke(255);
	fill(0);
}