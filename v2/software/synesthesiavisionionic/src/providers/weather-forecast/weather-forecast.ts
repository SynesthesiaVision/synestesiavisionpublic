import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { TextToSpeechProvider } from '../text-to-speech/text-to-speech';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';

/*
  Generated class for the WeatherForecastProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WeatherForecastProvider {

	private canGetWeather     : boolean  = true; // False when weather was previously solicited but hasn't been spoken
	private latitude          : string;
	private longitude         : string;

	// TTS Strings
	private startCheckWeather : string = 'Previsão do tempo acionada';
	private gpsDeactived      : string = 'GPS desativado, impossível obter localização do usuário';
	private alreadyRequesting : string = 'Processando previsão do tempo';
	private cantGetWeather    : string = 'Não foi possível acessar a previsão do tempo';

	constructor(public http: HTTP, public alertCtrl: AlertController,
				public locationAccuracy: LocationAccuracy, public ttsProvider: TextToSpeechProvider,
				public geolocation: Geolocation, public mobileAcc: MobileAccessibility) {
		console.log('Hello WeatherForecastProvider Provider');
	}

	/**
     * Set the coordinates which come from the GPSTracker
     *
     * @param      latitude   The latitude
     * @param      longitude  The longitude
     */
	setCoordinates(latitude: string, longitude: string){
		this.latitude = latitude;
		this.longitude = longitude;
	}

	/**
     * Gets the weather on specified location.
     *
     * @return     The weather.
     */
	getWeather(){
		//Não existe mais? Falar com Michael
		//let url = 'http://sweetglass.azurewebsites.net/weather';
		//Trocar a key 
		let openWeatherAppKey : string = '457dbe6ae9995dbadf75c7a34f1d8e03';
		let url               : string = 'http://api.openweathermap.org/data/2.5/weather?lang=pt';
		let Currentlang       : string = 'pt'; // Linguagem da descrição em portugues
		let unidade           : string = 'metric'; // Unidade em  ° C
		let resultado         : any;

		this.http.setRequestTimeout(15);
		this.http.get(url, {lat: this.latitude, lon: this.longitude, lang: Currentlang, units: unidade, appid: openWeatherAppKey}, {responseType: 'json'}).then((success) => {

			// Transforma os dados recebidos em string JSON, para um objeto
			resultado = JSON.parse(success.data);
			
			// Fala a previsão
			this.ttsProvider.speak(resultado.weather[0].description + ' e temperatura de ' + resultado.main.temp + ' °C');
			// this.mobileAcc.speak(resultado.weather[0].description + ' e temperatura de ' + resultado.main.temp + ' °C', 1);
			//Disponibiliza para uma nova solicitação
			this.canGetWeather = true;

		}).catch((err)=> {
			this.canGetWeather = true;

			let alert = this.alertCtrl.create({
				title: 'Erro',
				message: err,
				buttons: ['OK']
			});
	
			alert.present();
		});
	}

	verifyRequest(){
		return this.locationAccuracy.canRequest();
	}

	// Pede ao usuário para ativar a localização do dispositivo (se não estiver acionada)
	requestLocalization(canRequest: boolean){

		if(canRequest){
			return this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
		}
	}

	// Busca a localização atual do usuário
	getUserPosition(){
		return this.geolocation.getCurrentPosition();
	}

	startChecking(){

		if(this.canGetWeather){

			this.canGetWeather = false;
            this.ttsProvider.speak(this.startCheckWeather);
            // this.mobileAcc.speak(this.startCheckWeather, 1);
			
			this.verifyRequest()
				.then((canRequest: boolean) => {
					return this.requestLocalization(canRequest);
				})
				.then(()=> {
					return this.getUserPosition();		
				})
				.then((pos)=> {
					this.setCoordinates((pos.coords.latitude).toString(), (pos.coords.longitude).toString());

					return this.getWeather();
				}).catch((err) => {
					this.canGetWeather = true;
                    this.ttsProvider.speak(this.cantGetWeather);
                    // this.mobileAcc.speak(this.cantGetWeather, 1);
				});
		} else{
            this.ttsProvider.speak(this.alreadyRequesting);
            // this.mobileAcc.speak(this.alreadyRequesting, 1);
		}
	}
	
}