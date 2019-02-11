/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var QUAL_MUL = 30;

//from visualizer
var WIDTH = 640;
var HEIGHT = 360;

var SMOOTHING = 0.8;
var FFT_SIZE = 2048;

//
function FilterSample() {

  // from visualizer
  this.analyser = context.createAnalyser();
  this.analyser.connect(context.destination);
  this.analyser.minDecibels = -140;
  this.analyser.maxDecibels = 0;
  //
    loadSounds(this, {
        buffer: 'return.mp3'
      }, onLoaded);
// from visualiser
this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
this.times = new Uint8Array(this.analyser.frequencyBinCount);
//
      function onLoaded() {
        var button = document.querySelector('button');
        button.removeAttribute('disabled');
        button.innerHTML = 'Play/pause';
      };
  this.isPlaying = false;

  // fra visualizer
  this.startTime = 0;
  this.startOffset = 0;
  
};
// //
 
// VolumeSample.prototype.play = function() {
//     this.gainNode = context.createGain();
//     this.source = context.createBufferSource();
//     this.source.buffer = this.buffer;
// //

FilterSample.prototype.play = function() {
  // Create the source. 
  var source = context.createBufferSource();
  source.buffer = this.buffer;

  // adding gainNode
  gainNode = context.createGain();

  // Create the filter.
  var filter = context.createBiquadFilter();
  filter.type = filter.LOWPASS;
  filter.frequency.value = 5000;


// // prøver noe eksperimentelt
// //   // Connect source to filter, filter to destination.
//  source.connect(filter);
//    filter.connect(context.destination);

// // // Connect source to a gain node

// // // Connect gain node to destination
// source2.connect(gainNode);
//  gainNode.connect(context.destination);
// // prøver noe eksperimentelt


// this is working
// Connect source to filter, filter to destination.
  source.connect(gainNode);
  gainNode.connect(filter);

// Connect gain node to destination
filter.connect(context.destination);
// this is working


  // Play!
  source[source.start ? 'start' : 'noteOn'](0);
  source.loop = true;

  

  // // Save source and filterNode for later access.
  this.source = source;
  this.filter = filter;
  this.gainNode = gainNode;

};

FilterSample.prototype.stop = function() {
  this.source.stop(0);
};




FilterSample.prototype.changeFrequency = function(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  this.filter.frequency.value = maxValue * multiplier;
};


FilterSample.prototype.changeQuality = function(element) {
  this.filter.Q.value = element.value * QUAL_MUL;
};



// adding "changeVolume"

FilterSample.prototype.changeVolume = function(element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  // Let's use an x*x curve (x-squared) since simple linear (x) does not
  // sound as good.
  this.gainNode.gain.value = fraction * fraction;
  
};




FilterSample.prototype.toggleFilter = function(element) {
  this.source.disconnect(0);
  this.filter.disconnect(0);
  this.gainNode.disconnect(0);
  // Check if we want to enable the filter.
  if (element.checked) {
    // Connect through the filter.
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.filter);
    this.filter.connect(context.destination);
  } else {
    // Otherwise, connect directly.
    this.source.connect(this.gainNode);
    this.gainNode.connect(context.destination);
  }
};



FilterSample.prototype.stop = function() {
  this.source[this.source.stop ? 'stop' : 'noteOff'](0);
};

FilterSample.prototype.toggle = function() {
  this.isPlaying ? this.stop() : this.play();
  this.isPlaying = !this.isPlaying;
};
