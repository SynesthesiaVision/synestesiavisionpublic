import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { NativeStorage } from '@ionic-native/native-storage';
import { AudioProvider } from '../audio/audio';
// import { SynesthesiavisionPage } from '../../pages/synesthesiavision/synesthesiavision';
import { WeatherForecastProvider } from '../weather-forecast/weather-forecast';

/*
  Generated class for the BluetoothProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BluetoothProvider {

	// Variables
	private isEnabled         : boolean = false;
	private isConnected       : boolean = false; 
	// private rx_buffer         : string;
	private numberSensor      : number   = 3;
	private distanceSensor    : number[] = [this.numberSensor];

	// Delimiters
	private DELIMITER         : string = '\n';
	private DMAX              : number = 150;
	private DMIN              : number = 30;
	
	//Sound Variables
    public volume: any = 50;
	public isPlaying: boolean = false;
    public tracks: any = [
		{
		   	artist  : 'Time Synesthesia',
			name    : 'Confirmar bluetooth',
		   	track   : 'assets/sounds/bluetooth_confirma.ogg'
		},
		{
			artist  : 'Time Synesthesia',
		   	name    : 'Erro bluetooth',
		   	track   : 'assets/sounds/bluetooth_erro.ogg'
		},
		{
			artist  : 'Time Synesthesia',
		   	name    : 'Som synesthesia',
		   	track   : 'assets/sounds/synesthesia_sound.ogg'
		},
		{
			artist  : 'Time Synesthesia',
		   	name    : 'Finalizar aplicativo',
		   	track   : 'assets/sounds/finalizar.ogg'
		}
	];

	constructor(public http: HttpClient, public bluetoothSerial: BluetoothSerial,
				public nativeStorage: NativeStorage, public audioProvider: AudioProvider,
				public weatherForecastProvider: WeatherForecastProvider) {
		console.log('Hello BluetoothProvider Provider');
	}

	connectToDevice(address: string){
		return this.bluetoothSerial.connect(address);
	}

	/**
     * Salva o endereço do dispositivo pressionado caso haja uma conexão bem sucedida
     * @param address
    */
    saveAddress(address: string){
        this.nativeStorage.setItem('bt_address', address).then(() => { 
            console.log('Stored item!')
        }).catch((err) => {
			console.log('Error storing item: ', err);
		});
    }

    /**
     * Verify if the local storage has the address of a synesthesia device
     */
    checkAddress(){
		
        this.nativeStorage.getItem('bt_address').then((success) => {
			this.autoConnect(success);
		}).catch((err) => {
			console.log(err);
		});
    }

    /**
     * Se conecta a um endereço bluetooth já conhecido e redireciona para a página principal
     * @param address
     */
    autoConnect(address: string){

		this.connectToDevice(address).subscribe((success) => {

			this.loadSound('assets/sounds/bluetooth_confirma.ogg');
			this.isConnected = true;
		}, (fail) => {

			this.loadSound('assets/sounds/bluetooth_erro.ogg');
			this.isConnected = false;
		});
	}

	getDistanceSensor(): number[]{
		return this.distanceSensor;
	}

	/**
     * Saves a distance which comes from the glass.
     *
     * @param sensor   The sensor which value will be saved.
     * @param distance Save specified sensors distance.
     */
    public saveData(sensor: string, distance: number) {

        if(distance < this.DMAX) {
            if (sensor == 'a') {
                this.distanceSensor[2] = distance;
            }
            //Front
            else if (sensor == 'b') {
                this.distanceSensor[1] = distance;
            }
            //Left
            else if (sensor == 'c') {
                this.distanceSensor[0] = distance;
            }
		}
	}
	
	getBluetoothData(){
		return this.bluetoothSerial.subscribe(this.DELIMITER);
	}

	processData(data) : Promise<string>{

		return new Promise((resolve, reject) => {
			
			if(data.includes('bt')){
                let idx = data.indexOf('bt');
                data = data.substring(idx);
				resolve(data);
            }
            
			let inx = data.indexOf(this.DELIMITER);
	
			//Get the first character responsable for indentifier the sensor
			let sensor1 = data.substring(0, 1);
			
			//Get the distance after character
			let distance = "";
			
			try{
				distance = data.substring(1, inx);
			} catch(err) {
				console.log('Error: ' + err);
			}
			
			//Get the primary character at message, which corresponds to sensor which has sent the distance
			let sensor = sensor1.charAt(0);
	
			//If have any data, it will save.
			//Modificar 
			if(typeof sensor === "string" && typeof distance.charAt(0) === "string") {
				if (!this.isEmpty(distance) && distance.search("DISCONNECTED") == -1) {
					this.saveData(sensor, Number(distance));
				}
			}

			resolve('true');
		});
		
	}

	public getDistanceMin(){
		
		return new Promise((resolve, reject) => {

			let disMin;

			//return maior = Math.max.apply(null, this.distanceSensor );
			if (this.distanceSensor[0] < this.distanceSensor[1] && this.distanceSensor[0] < this.distanceSensor[2]) {
	
				disMin = this.distanceSensor[0];
			} else if (this.distanceSensor[1] < this.distanceSensor[0] && this.distanceSensor[1] < this.distanceSensor[2]) {
	
				disMin = this.distanceSensor[1];
			} else if (this.distanceSensor[2] < this.distanceSensor[0] && this.distanceSensor[2] < this.distanceSensor[1]) {
	
				disMin = this.distanceSensor[2];
			}

			resolve(disMin);
		});
	}

    /** 
     * Verify if the bluetooth is enable, if not, enable it
     */
    checkEnabledBluetooth(): boolean{

        this.bluetoothSerial.isEnabled().then((ativado) => {
            this.isEnabled = true;
        }, (naoAtivado) => {
            
            //Pede ao usuário para habilitar o bluetooth
            this.bluetoothSerial.enable().then((success) => {
                this.isEnabled = true;
            }, (err) => {
                this.isEnabled = false;
            });
		});
		
		return this.isEnabled;
	}
	
	loadSound(track : string){
		if(!this.isPlaying){
			this.triggerPlayback(track);
		}
		else{
			this.isPlaying  = false;
			this.stopPlayback();
			this.triggerPlayback(track);
		}
	}

	triggerPlayback(track : string){
		this.audioProvider.loadSound(track);
		this.isPlaying  = true;
	}

	stopPlayback(){
		this.isPlaying  = false;
		this.audioProvider.stopSound();
	}

	/**
	 * Implementation of method isEmpty. Receives a string data and verify it's length
	 * if it's equals 0 returns true otherwise, returns false;
	 * 
	 * @param data String to check it's length
	 */
	private isEmpty(data: string): boolean{
		if(data.length == 0){
			return true;
		} else {
			return false;
		}
	}
}
