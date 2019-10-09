import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { SynesthesiavisionPage } from '../synesthesiavision/synesthesiavision';
import { NativeStorage } from '@ionic-native/native-storage';
import { AudioProvider } from '../../providers/audio/audio';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { TextToSpeechProvider } from '../../providers/text-to-speech/text-to-speech';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';

/**
 * Generated class for the BluetoothConnectionVerifyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: 'page-bluetooth-connection-verify',
    templateUrl: 'bluetooth-connection-verify.html',
})
export class BluetoothConnectionVerifyPage {

    private isEnabled: boolean = false;

    //Bluetooth Variables
    private unpairedDevices: any[];
    private gettingDevices: boolean;
    private loading: any;

    //Sound Variables
    // public volume: any = 50;
    public isPlaying: boolean = false;

    //Variaveis da fala
    private escaneamentoIniciado: any = 'Procurando dispositivos disponíveis.';
    private escaneamentoConlcuido: any = 'Busca concluída.';

    constructor(
        private bluetoothSerial: BluetoothSerial, public navCtrl: NavController,
        public navParams: NavParams, public alertCtrl: AlertController,
        public loadingCtrl: LoadingController, public nativeStorage: NativeStorage,
        public audioProvider: AudioProvider, public bluetoothProvider: BluetoothProvider,
        public ttsProvider: TextToSpeechProvider, public mobileAcc: MobileAccessibility) {

        this.checkEnabledBluetooth();
    }

    ionViewDidLoad(){
        this.loadSound('assets/sounds/synesthesia_sound.ogg');
    }

    ionViewWillEnter(){
        this.bluetoothSerial.isConnected().then((result) => {
            if(result){
                this.loadSound('assets/sounds/bluetooth_erro.ogg');
                this.bluetoothSerial.disconnect();
            }
        }).catch((err) => {
            console.log("Error Bluetooth: ", err);
        });
    }

	/**
     * Scans for paired and unpaired devices.
     * If an paired device has the Synesthesia name, the method looks for an address in the localStorage
     */
    startScanning(){
        this.ttsProvider.speak(this.escaneamentoIniciado);
        // this.mobileAcc.speak(this.escaneamentoIniciado, 1);

        let dispositivoSynesthesia: any;
        this.unpairedDevices = [];
        this.gettingDevices = true;

        //this.navCtrl.push(SynesthesiavisionPage);

        //Exibe o loading spinner
        this.createLoading();
        this.loading.present();

        while(!this.isEnabled){
            this.checkEnabledBluetooth();
        }

        //Verifica os dispositivos não pareados 
        this.bluetoothSerial.discoverUnpaired().then((dispositivosNaoPareados) => {

            //dispositivosNaoPareados é a lista de devivces
            this.unpairedDevices = dispositivosNaoPareados;

            for(let index = 0; index < this.unpairedDevices.length; index++){
                let dispositivo = this.unpairedDevices[index];

                if(dispositivo.name != undefined){
                    if((dispositivo.name).includes("Synesthesia")){
                        dispositivoSynesthesia = dispositivo;
                    }
                }
            }

            //Lista os dispositivos que já foram pareados
            this.bluetoothSerial.list().then((dispositivosPareados) => {

                this.ttsProvider.speak(this.escaneamentoConlcuido);
                // this.mobileAcc.speak(this.escaneamentoConlcuido, 1);

                if(dispositivoSynesthesia != undefined){

                    // Melhorar este bloco de código
                    dispositivosPareados.forEach((element, index) => {

                        //Se já estiver pareado com o synesthesia, pega o address local e connecta automaticamente
                        if(dispositivoSynesthesia.name == element.name){
                            this.checkAddress(element);
                        }
                    });
                }

                this.gettingDevices = false;

                //Deixa de exibir o loading spinner
                this.loading.dismiss();
            }).catch((err) => {
                console.log('Error: ' + err);

                this.gettingDevices = false;

                //Deixa de exibir o loading spinner
                this.loading.dismiss();
            });
        }).catch((err) => {
            console.log('Deu ERRO: ' + err);

            //Deixa de exibir o loading spinner
            this.loading.dismiss();

            //Caso ocorra algum erro, exibe qual foi o erro
            this.showAlert('Erro ao conectar no Bluetooth');
        });


    }

    success = (data) => alert(data);
    fail = (error) => alert('Erro ao conectar no Bluetooth');


    /**
     * Exibe um alerta perguntando se o usuário deseja se conectar a um endereço que 
     * foi selecionado pelo usuário.
     * 
     * Redireciona para a tela principal se o usuário desejar se conectar
     * @param address
     */
    selectDevice(device: any){

        let alert = this.alertCtrl.create({
            title: 'Connect',
            message: 'Do you want to connect with' + device.address + '?',
            buttons:
                [
                    {
                        text: 'Cancel',
                        role: 'cancel',

                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Connect',

                        handler: () => {

                            if((device.name).includes('Synesthesia')){

                                this.bluetoothSerial.connect(device.address).subscribe((success) => {

                                    this.loadSound('assets/sounds/bluetooth_confirma.ogg');
                                    this.saveAddress(device);

                                    //Após conectar direcionar para a página principal do synesthesia
                                    this.synesthesia();

                                }, (error) => {
                                    console.log(error);
                                    this.loadSound('assets/sounds/bluetooth_erro.ogg');
                                    this.navCtrl.popToRoot({});
                                });
                            } else{
                                this.ttsProvider.speak('Não é possível conectar, não é um dispositivo Synesthesia');
                                // this.mobileAcc.speak('Não é possível conectar, não é um dispositivo Synesthesia', 1);
                            }

                        }
                    }
                ]
        });

        alert.present();

    }

    /**
     * Disconnect the blueooth 
     */
    disconnect(){

        let alert = this.alertCtrl.create({
            title: 'Disconnect?',
            message: 'Do you want to Disconnect?',
            buttons:
                [
                    {
                        text: 'Cancel',
                        role: 'cancel',

                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Disconnect',

                        handler: () => {
                            this.bluetoothSerial.disconnect();
                        }
                    }
                ]
        });

        alert.present();
    }

    /**
     * Sends to the main page
     */
    synesthesia(){
        this.navCtrl.push(SynesthesiavisionPage);
    }

    /**
     * Creates an alert error, with the error message parameter
     * @param message 
     */
    showAlert(message: string){

        let alert = this.alertCtrl.create({
            title: 'Error',
            message: message,
            buttons: ['OK']
        });

        alert.present();
    }

    /**
     * Creates the loading screen
     */
    createLoading(){

        let loading = this.loadingCtrl.create({
            content: 'Procurando dispositivos, por favor aguarde...',
            dismissOnPageChange: true
        });

        this.loading = loading;
    }

    /**
     * Salva o endereço do dispositivo pressionado caso haja uma conexão bem sucedida
     * @param address
     */
    saveAddress(device){
        this.nativeStorage.setItem('bt_address_' + device.name, device.address).then(() => {
            console.log('Stored item!')
        }, error => {
            console.error('Error storing item', error)
        });
    }

    /**
     * Verify if the local storage has the address of a synesthesia device
     */
    checkAddress(device){
        this.nativeStorage.getItem('bt_address_' + device.name).then((macDispositivo) => {
            this.autoConnect(macDispositivo);
        }, (err) => {
            console.log();
        });
    }

    /**
     * Se conecta a um endereço bluetooth já conhecido e redireciona para a página principal
     * @param address
     */
    autoConnect(address: string){

        this.bluetoothSerial.connect(address).subscribe((success) => {
            this.loadSound('assets/sounds/bluetooth_confirma.ogg');
            this.synesthesia();
        }, (fail) => {
            this.loadSound('assets/sounds/bluetooth_erro.ogg');
            this.navCtrl.popToRoot({});
        });
    }

    /** 
     * Verify if the bluetooth is enable, if not, enable it
     */
    checkEnabledBluetooth(){
        this.isEnabled = this.bluetoothProvider.checkEnabledBluetooth();
    }

    /* Audio Methods
       .
       .
       .
    */
    loadSound(track: string){
        if(!this.isPlaying){
            this.triggerPlayback(track);
        } else {
            this.isPlaying = false;
            this.stopPlayback();
            this.triggerPlayback(track);
        }
    }

    triggerPlayback(track: string){
        this.audioProvider.loadSound(track);
        this.isPlaying = true;
    }

    stopPlayback(){
        this.isPlaying = false;
        this.audioProvider.stopSound();
    }
}
