let centroidplot = 0.0;
let spectralCentroid = 0;

exports.run = (audio, midi, assets) => {
	background(0);
	stroke(0,255,0);
	strokeWeight(1);
	fill(0,255,0); // spectrum is green

	translate(-width/2, -height/2, 0);

	//draw the spectrum
	for (let i = 0; i< audio.spectrum.length; i++){
	  let x = map(log(i), 0, log(audio.spectrum.length), 0, width);
	  let h = map(audio.spectrum[i], 0, 255, 0, height);
	  let rectangle_width = (log(i+1)-log(i))*(width/log(audio.spectrum.length));
	  rect(x, height, rectangle_width, -h )
	}

	let nyquist = 22050;

	// the mean_freq_index calculation is for the display.
	let mean_freq_index = spectralCentroid/(nyquist/audio.spectrum.length);

	centroidplot = map(log(mean_freq_index), 0, log(audio.spectrum.length), 0, width);

	stroke(255,0,0); // the line showing where the centroid is will be red
}