import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
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
import { GamePage } from '../game/game';
import { PermissionProvider } from '../../providers/permission/permission';
import { AudioProvider3 } from '../sound-tracker/audio';
declare var TextDecoder: any

/**
 * Generated class for the SynesthesiavisionlePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const GLASS_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const GLASS_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';


@Component({
  selector: 'page-synesthesiavisionle',
  templateUrl: 'synesthesiavisionle.html',
})
export class SynesthesiavisionlePage {

  private devices: any[] = [];
  peripheral: any = {};

  // Variables
  private bluetoothSubscription: any;
  private verificandoLuminosidade: boolean = false;

  // TTS Strings
  private verificarLuminosidade: string = 'Verificando luminosidade do ambiente';
  private processandoLuminosidade: string = 'Processando verificação de luminosidade';

  //Modificar
  private variaveis: any = { side: Number, sound_duration: Number, track: String, frequencia: Number };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public mobileAccessibility: MobileAccessibility, public weatherForecastProvider: WeatherForecastProvider,
    public geolocation: Geolocation, public locationAccuracy: LocationAccuracy,
    public vibrator: Vibration, public ttsProvider: TextToSpeechProvider,
    public bluetoothProvider: BluetoothProvider, public bluetoothSerial: BluetoothSerial,
    public audioProvideGamePager2: AudioProvider3, public busIntegration: BusIntegrationProvider,
    public permissionsProvider: PermissionProvider, public mobileAcc: MobileAccessibility,
    private ble: BLE, private alertCtrl: AlertController, private ngZone: NgZone) {

    this.variaveis.side = 1;
    this.variaveis.sound_duration = 0.8;
    this.variaveis.track = 'assets/sounds/bu1seg.ogg';
    this.variaveis.frequencia = 1;

    let device = navParams.get('device');

    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => console.log('')      
    )

  }

  onConnected(peripheral) {
    this.peripheral = peripheral;
    this.setStatus('Connected to ' + (peripheral.name || peripheral.id) + ' on synesthesia page');

    this.ble.startNotification(this.peripheral.id, GLASS_SERVICE, GLASS_CHARACTERISTIC).subscribe(
      data => this.onDataChange(data),
      () => console.log('')
    )

    this.ble.read(this.peripheral.id, GLASS_SERVICE, GLASS_CHARACTERISTIC).then(
      data => this.onDataChange(data),
      () => console.log('')
    ) 
  }

  onDataChange(buffer: ArrayBuffer) {
    console.log("String: " + new TextDecoder('utf-8').decode(buffer));
    this.getFunction(new TextDecoder('utf-8').decode(buffer));
  }


  ionViewDidLoad() {
    this.permissionsProvider.getPermissions();
  }

  ionViewWillLeave() {
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
      
    )
  }

	/**
	 * Uses the weatherForecastProvider to verify the user's Position 
	 * and it's weather.
	 */
  checkWeather() {
    this.weatherForecastProvider.startChecking();
  }


  getFunction(bluetoothData) {

    let data = bluetoothData.slice(3, 6);

    switch (data) {
      case 'wea': return this.checkWeather();
      case 'lum': return this.speakLuminosity(bluetoothData);
      case 'oni': return this.getParadaProxima();
    }
  }

  getParadaProxima() {
    this.navCtrl.push(HorariosPage);
  }

  speakLuminosity(dataBuffer) {
    if (!this.verificandoLuminosidade) {

      this.ttsProvider.speak(this.verificarLuminosidade);
      // this.mobileAcc.speak(this.verificarLuminosidade);

      if (dataBuffer.includes('1')) {
        this.ttsProvider.speak('O ambiente está claro.');
        // this.mobileAcc.speak('O ambiente está claro.', 1);
      } else {
        this.ttsProvider.speak('O ambiente está escuro.');
        // this.mobileAcc.speak('O ambiente está escuro.', 1);
      }
    } else {
      this.ttsProvider.speak(this.processandoLuminosidade);
      // this.mobileAcc.speak(this.processandoLuminosidade, 1);
    }
  }

  getLuminosidade(bluetoothData) {
    this.speakLuminosity(bluetoothData);
  }

  voltarConexaoBluetooth() {
    this.navCtrl.pop();
  }

  startGame(peripheral) {
    console.log("Jogo iniciado");
    this.navCtrl.push(GamePage, {
      peripheral: peripheral
    });
  }

  showAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  setStatus(message) {
    console.log(message);
  }
}
