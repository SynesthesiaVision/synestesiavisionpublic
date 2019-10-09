import { Http, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
  Generated class for the AudioProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

declare var AudioContext: any;
declare var	webkitAudioContext: any;

@Injectable()
export class AudioProvider {

	//Web Audio Api variables
	private _preloader : any;
	private _track : any = null;
	private _audio : any;
	private _source : any;
	private _context : any = new (AudioContext || webkitAudioContext)();
	private _gain : any = null;

	//Controlling Variables
	private volumeEsquerdo;
	private volumeDireito;
	private frequencia;
	// private isLoop: boolean;

	constructor(public http: Http, private _LOADER: LoadingController) {
		console.log('Hello AudioProvider Provider');
	}

	setVolume(volumeEsquerdo, volumeDireito){
		this.volumeEsquerdo = volumeEsquerdo;
		this.volumeDireito = volumeDireito;
	}

	setRate(frequency){
		this.frequencia = frequency;
	}

	playSoundOscillator(){
		let osc = this._context.createOscillator(); // instantiate an oscillator
		osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
		osc.frequency.value = 440; // Hz
		osc.connect(this._context.destination); // connect it to the destination
		osc.start(); // start the oscillator
		osc.stop(this._context.currentTime + 2); // stop 2 seconds after the current time
	}

	loadSound(track){

		// this.displayPreloader('Loading track...');

		this.http.get(track, { responseType: ResponseContentType.ArrayBuffer })
			.map(res => res.arrayBuffer())
			.subscribe((arrayBufferContent : any) => {
				this.setUpAudio(arrayBufferContent);
			});
	}

	setUpAudio(bufferedContent: any){
		this._context.decodeAudioData(bufferedContent, (buffer: any) => {
			this._audio = buffer;
			this._track = this._audio;

			this.test(this._track);
		});
	}
	
	playSound(track){
		if(!this._context.createGain){
			this._context.createGain = this._context.createGainNode;
		}

		this._gain = this._context.createGain();
		this._source = this._context.createBufferSource();
		this._source.buffer = track;
		this._source.connect(this._gain);
		this._gain.connect(this._context.destination);

		this._source.start(0);
		// this.hidePreloader();
	}

	stopSound(){
		if(!this._source.stop){
			this._source.stop = this._source.noteOff;
		}

		this._source.stop(0);
	}
	
	displayPreloader(message){
		this._preloader = this._LOADER.create({
			content: message
		});

		this._preloader.present();
	}
	
	hidePreloader(){
		this._preloader.dismiss();
	}

	changeVolume(volume){
		let percentile: number = parseInt(volume) / 100;
		
		// A straightforward use of the supplied value sounds awful
		// so we're using a fraction of the supplied value to
		// handle this situation
		console.log('Volume: ' + percentile);
		this._gain.gain.value = percentile * percentile;
	}

	panner(track){

		this._gain = this._context.createStereoPanner();

		this._source = this._context.createBufferSource();
		this._source.buffer = track;
		
		this._gain.pan.value = 0;
		
		this._source.connect(this._gain);
		this._gain.connect(this._context.destination);

		this._source.start(0);
		// this.hidePreloader();
	}

	test(track){

		this._gain = this._context.createStereoPanner();
		let biquadFilter = this._context.createBiquadFilter();
		this._source = this._context.createBufferSource();

		//Create the source
		this._source.buffer = track;
		this._gain.pan.value = 0;

		// Descobrir como funciona o filtro
		biquadFilter.type = "lowshelf";
		biquadFilter.frequency.value = 350;
		biquadFilter.gain.value = 5; // Volume do gain
		biquadFilter.detune.value = 440;

		this._source.connect(this._gain);
		this._gain.connect(biquadFilter);
		biquadFilter.connect(this._context.destination);
		
		this._source.loop = false; // Som em loop?
		this._source.playbackRate.value = 1.0; // Velocidade de reprodução do som
		this._source.start(0); // Inicia a reprodução do som
		// this.hidePreloader();
	}


	defineSound(){
		this.loadSound('assets/sounds/bu.ogg');
	}
}
