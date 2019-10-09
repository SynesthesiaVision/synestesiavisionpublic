import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech';

/*
  Generated class for the TextToSpeechProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TextToSpeechProvider {

	private TTSOptions : any;

	constructor(public http: HttpClient, public tts: TextToSpeech) {
		console.log('Hello TextToSpeechProvider Provider');
	}

	createTTSOptions(message: string = 'No message provided', rate: number = 1, local: string = 'pt-BR'){
		this.TTSOptions = {
			text   : message,
			locale : local,
			rate   : rate
		};
	}

	speak(message: string){

		return this.tts.speak({
			text   : message,
			locale : 'pt-BR',
			rate   : 1
		});
	}

	speakWithOptions(){

		this.tts.speak(this.TTSOptions).then((success) => {
			console.log(success);
		}).catch( (err) => {
			console.log(err)
		});
	}
}
