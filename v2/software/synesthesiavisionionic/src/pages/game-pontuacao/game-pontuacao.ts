import { Observable } from 'rxjs/Observable';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/observable/interval'
declare var TextDecoder: any

/**
 * Generated class for the GamePontuacaoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
const GLASS_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const GLASS_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

@Component({
  selector: 'page-game-pontuacao',
  templateUrl: 'game-pontuacao.html',
})
export class GamePontuacaoPage {
  peripheral: any = {};
  pontuacao: number = 1000;
  private timerVar: Subscription;
  timerVal;
  distance;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private ble: BLE, private alertCtrl: AlertController, private ngZone: NgZone) {

    let device = navParams.get('device');

    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected')
    )
    this.startTimer();
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
    let value = new TextDecoder('utf-8').decode(buffer);
    console.log("String: " + value);
    if (value === 'bt_bateu') {
      this.pontuacaoBateu();
    }
  }

  ionViewWillLeave() {
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))

    )
  }

  startTimer() {
    this.timerVar = Observable.interval(1000).subscribe(x => {
      console.log(x);
      this.timerVal = x;
    })
  }

  pontuacaoBateu() {
    for (var i = 0; i < 20; i++) {
      this.pontuacao--;
    }
    console.log("Bati");
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

  stopGame() {
    this.timerVar.unsubscribe();
    this.pontuacao = this.pontuacao/this.timerVal;
  }
}
