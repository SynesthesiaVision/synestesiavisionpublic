import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { WeatherForecastProvider } from '../../providers/weather-forecast/weather-forecast';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { TextToSpeechProvider } from '../../providers/text-to-speech/text-to-speech';
import { Vibration } from '@ionic-native/vibration';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BusIntegrationProvider } from '../../providers/bus-integration/bus-integration';
import { HorariosPage } from '../horarios/horarios';
import { PermissionProvider } from '../../providers/permission/permission';
import { AudioProvider3} from '../sound-tracker/audio';

/**
 * Generated class for the SynesthesiavisionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
	selector: 'page-synesthesiavision',
	templateUrl: 'synesthesiavision.html',
})
export class SynesthesiavisionPage {

	// Variables
	public statusButton             : string   = 'INICIAR';
	private init                    : boolean  = true; // True when is not playing, False when is playing
	private frequencySound          : number   = 1;
	private frequencySoundMs        : number   = 100;
	// private numberSensor         : number   = 3;
	// private currentSensor        : number   = 0;
	// private distanceSensor       : number[] = [this.numberSensor];
	// private intervalo            : any; // To execute the sound in loop
	// private volume			      : number = 50;
    private bluetoothSubscription   : any;
    private verificandoLuminosidade : boolean = false;

	// Vibration Patterns
	private patternOn               : number[] = [200, 200, 200, 200, 200]; // Vibrates 3 times
	private patternOff              : number[] = [200, 200, 200]; // Vibrates 2 times

	// Delimiters
	private MAX                     : number = 5; // Maximun frequency for frequencySound
	private MIN                     : number = 1; // Minimun frequency for frequencySound

	// TTS Strings
	private startSonorization       : string = 'Iniciando sonorização';
	private pauseSonorization       : string = 'Pausando sonorização';
	private upFrequency             : string = 'Aumentando frequência';
	private downFrequency           : string = 'Diminuindo frequência';
	private maxLimitRange           : string = 'Frequência máxima atingida';
    private minLimitRange           : string = 'Frequência mínima atingida';
    private verificarLuminosidade   : string = 'Verificando luminosidade do ambiente'; 
    private processandoLuminosidade : string = 'Processando verificação de luminosidade';

	//Modificar
	private variaveis               : any = { side: Number, sound_duration: Number, track: String, frequencia: Number };

	constructor(public navCtrl: NavController, public navParams: NavParams, 
				public mobileAccessibility: MobileAccessibility, public weatherForecastProvider: WeatherForecastProvider,
				public geolocation: Geolocation, public locationAccuracy: LocationAccuracy,
				public vibrator: Vibration, public ttsProvider: TextToSpeechProvider,
				public bluetoothProvider: BluetoothProvider, public bluetoothSerial: BluetoothSerial,
                public audioProvider2: AudioProvider3, public busIntegration : BusIntegrationProvider, 
                public permissionsProvider: PermissionProvider, public mobileAcc: MobileAccessibility) {

		this.variaveis.side = 1;
		this.variaveis.sound_duration = 0.8;
		this.variaveis.track = 'assets/sounds/bu1seg.ogg';
		this.variaveis.frequencia = 1;
	}



	ionViewDidLoad(){
		this.permissionsProvider.getPermissions();

		this.bluetoothSubscription = this.getBluetoothData();
	}

	ionViewWillLeave(){
		this.bluetoothSubscription.unsubscribe();
	}

	ionViewWillEnter(){
		this.bluetoothSubscription = this.getBluetoothData();
	}

	toggleStatusButton(){
		if(this.init){

			this.statusButton = 'PAUSAR';
			this.init = false;

            this.playSound();
		} else {

			this.statusButton = 'INICIAR';
			this.init = true;

            this.stopSound();
		}
	}

	playSound(){
        //Fala que está inicializando a sonorização
        this.ttsProvider.speak(this.startSonorization);
        // this.mobileAcc.speak(this.startSonorization, 1);

        //Começa a sonorizar
		this.playAudio();
        
        //Vibra o celular
		this.vibrator.vibrate(this.patternOn);
	}

	stopSound(){
        this.ttsProvider.speak(this.pauseSonorization);
        // this.mobileAcc.speak(this.pauseSonorization, 1);
		this.stopTimer();
		this.vibrator.vibrate(this.patternOff);
	}

	stopTimer(){
		this.audioProvider2.stopRunningSound();
	}

	playAudio(){
		this.audioProvider2.playSound();
	}

	/**
	 * Uses the weatherForecastProvider to verify the user's Position 
	 * and it's weather.
	 */
	checkWeather(){
        if(!this.init){
            this.toggleStatusButton();
        }

        this.weatherForecastProvider.startChecking();

	}

	increaseFrequency(){
		// this.audioProvider2.atualizarSensor(this.distanceSensor, this.variaveis);
		if(this.frequencySound < this.MAX){

			this.frequencySound += 1;

            this.ttsProvider.speak(this.upFrequency);
            // this.mobileAcc.speak(this.upFrequency, 1);
		
			if(!this.init){
				this.stopTimer();

				this.toggleStatusButton();
			}

		} else{

            this.ttsProvider.speak(this.maxLimitRange);
            // this.mobileAcc.speak(this.maxLimitRange, 1);
		}
	}

	decreaseFrequency(){
		
		if(this.frequencySound > this.MIN){

			this.frequencySound -= 1;
			
            this.ttsProvider.speak(this.downFrequency);
            // this.mobileAcc.speak(this.downFrequency, 1);
			
			if(!this.init){
				this.stopTimer();

				this.toggleStatusButton();
			}
		} else{

            this.ttsProvider.speak(this.minLimitRange);
            // this.mobileAcc.speak(this.minLimitRange, 1);
		}
	}
	
	/**
     * Handle the data which comes through Bluetooth socket.
     */
	private getBluetoothData(){
		return this.bluetoothProvider.getBluetoothData().subscribe((data) => {

            //Realiza o processamento dos dados
			this.bluetoothProvider.processData(data).then((result) => {
                
                console.log(result);

				if(!result.includes('true')){
					this.getFunction(result);
				}

			}) ;
		});
    }
    
    getFunction(bluetoothData){

        let data = bluetoothData.slice(3, 6);

        switch(data){
            case 'wea' : return this.checkWeather();
            case 'lum' : return this.speakLuminosity(bluetoothData);
            case 'oni' : return this.getParadaProxima();
            case 'som' : return this.toggleStatusButton();
        }
    }

	getParadaProxima(){
        if(!this.init){
            this.toggleStatusButton();
        }
        
		this.navCtrl.push(HorariosPage);
    }
    
    

	speakLuminosity(dataBuffer){

        if(!this.init){
            this.toggleStatusButton();
        }

        if(!this.verificandoLuminosidade){

            this.ttsProvider.speak(this.verificarLuminosidade);
            // this.mobileAcc.speak(this.verificarLuminosidade);
            
            if(dataBuffer.includes('1')){
                this.ttsProvider.speak('O ambiente está claro.');
                // this.mobileAcc.speak('O ambiente está claro.', 1);
            } else {
                this.ttsProvider.speak('O ambiente está escuro.');
                // this.mobileAcc.speak('O ambiente está escuro.', 1);
            }
        } else{
            this.ttsProvider.speak(this.processandoLuminosidade);
            // this.mobileAcc.speak(this.processandoLuminosidade, 1);
        }
    }
    getLuminosidade(bluetoothData){
		if(!this.init){
			this.toggleStatusButton();
		}
		this.speakLuminosity(bluetoothData);
	}
    voltarConexaoBluetooth(){
        this.navCtrl.pop();
    }
}
