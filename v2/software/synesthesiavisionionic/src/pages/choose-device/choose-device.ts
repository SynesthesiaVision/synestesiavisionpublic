import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController, Platform } from 'ionic-angular';
import { BluetoothConnectionVerifyPage } from '../bluetooth-connection-verify/bluetooth-connection-verify';
import { BluetoothleConnectionVerifyPage } from '../bluetoothle-connection-verify/bluetoothle-connection-verify';
/**
 * Generated class for the ChooseDevicePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-choose-device',
  templateUrl: 'choose-device.html',
})

export class ChooseDevicePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChooseDevicePage');
  }

  oculosAntigo() {
      this.navCtrl.push(BluetoothConnectionVerifyPage);
  }

  oculosNovo() {
      this.navCtrl.push(BluetoothleConnectionVerifyPage);
  }
}
