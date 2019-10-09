import { Component } from '@angular/core';
import { NavController, NavParams, ViewController  } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the SynesthesiavisionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
	templateUrl: 'modal-renomear-parada.html'
})
export class ModalRenomearParadaPage {

    private labelParada;
    private apelidoParada;

    constructor(public navCtrl: NavController, public navParams: NavParams,
                public nativeStorage: NativeStorage, public viewCtrl: ViewController) {

        this.labelParada = this.navParams.get('labelParada');
        this.apelidoParada = this.navParams.get('nombreParada');
    }
    
    setRenomear(){
        this.nativeStorage.setItem(this.labelParada, this.apelidoParada).then(() => { 
            console.log('Stored item! Nome: + ' + this.apelidoParada);
            this.viewCtrl.dismiss(true);
        }, error => {
            console.error('Error storing item', error)
        });
    }

    dismiss() {
        this.viewCtrl.dismiss(false);
    }
}
