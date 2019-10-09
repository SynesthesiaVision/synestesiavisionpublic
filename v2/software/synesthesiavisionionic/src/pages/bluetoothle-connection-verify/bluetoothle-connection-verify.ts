
import { BLE } from '@ionic-native/ble';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { SynesthesiavisionlePage } from '../synesthesiavisionle/synesthesiavisionle';
import { NativeStorage } from '@ionic-native/native-storage';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { PermissionProvider } from '../../providers/permission/permission';
import { TextToSpeechProvider } from '../../providers/text-to-speech/text-to-speech';

/**
 * Generated class for the BluetoothleConnectionVerifyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 const GLASS_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';

@Component({
  selector: 'page-bluetoothle-connection-verify',
  templateUrl: 'bluetoothle-connection-verify.html',
})
export class BluetoothleConnectionVerifyPage {

  private devices: any[] = [];
  private statusMessage: string;
  private isEnabled: boolean = false;

  constructor(public navCtrl: NavController,private toastCtrl: ToastController,
    private ble: BLE, private ngZone: NgZone,
    public bluetoothProvider: BluetoothProvider, public nativeStorage: NativeStorage,
    public ttsProvider: TextToSpeechProvider, public permissionsProvider: PermissionProvider) {

    this.checkEnabledBluetooth();
    this.permissionsProvider.getPermissions();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.scan();
  }

  scan() {
    console.log("Escaneando dispositivos próximos");
    this.setStatus('Scanning for Bluetooth LE Devices');
    this.devices = [];  // clear list

    console.log("Iniciando outro scan");
    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus('Error ' + error);
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  deviceSelected(device) {
    console.log(JSON.stringify(device) + ' selected');
    
    this.navCtrl.push(SynesthesiavisionlePage, {
      device: device
    });
  }

  checkEnabledBluetooth() {
    this.isEnabled = this.bluetoothProvider.checkEnabledBluetooth();
  }

  synesthesia() {
this.navCtrl.push(SynesthesiavisionlePage);
  }
}
