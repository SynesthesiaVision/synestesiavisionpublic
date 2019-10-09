import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//importando a página de welcome
//import { WelcomePage } from '../pages/welcome/welcome'; 
import { BluetoothConnectionVerifyPage } from '../pages/bluetooth-connection-verify/bluetooth-connection-verify';
import { ChooseDevicePage } from '../pages/choose-device/choose-device';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  //modificando a página inicial
  //rootPage:any = TabsPage;
  //rootPage:any = WelcomePage;

  //Ir diretamente para o verificador de bluetooth
  //rootPage:any = BluetoothConnectionVerifyPage;
  rootPage:any = ChooseDevicePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      platform.setLang("pt-BR", true);
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
