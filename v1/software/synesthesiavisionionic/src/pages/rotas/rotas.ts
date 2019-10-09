import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import Leaflet from 'leaflet';
import 'leaflet-routing-machine';

declare var L: any;

/**
 * Generated class for the RotasPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rotas',
  templateUrl: 'rotas.html',
})
export class RotasPage {

  public route : any;
  /*private lat : any;
  private long : any;*/

  @ViewChild('map') mapContainer: ElementRef;
  map: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RotasPage');
    /*this.geolocation.getCurrentPosition()
      .then((resp) => {
        this.lat = resp.coords.latitude;
        this.long = resp.coords.longitude;
      }).catch((error) => {
        console.log('Erro ao recuperar sua posição', error);
      });*/
    this.loadmap();
  }

  loadmap(){
    this.map = Leaflet.map("map").fitWorld();
    Leaflet.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);
    this.map.locate({
      setView: true,
      maxZoom: 16
    })

    let options = {language: 'pt-BR',
    profile: 'mapbox/walking'};

    //var control = Leaflet.Routing.control({
    Leaflet.Routing.control({
    waypoints: [
    Leaflet.latLng(-8.057427, -34.953071),
    Leaflet.latLng(-8.055387, -34.956203)
  ],
  hide: true,
  router: Leaflet.Routing.mapbox("pk.eyJ1IjoibGlkeWFuIiwiYSI6ImNqdG9uNHYwbTBnMXk0NG1xdTFjMnhzcW4ifQ.-JEJ9QFFoBoII-0XxGV5xg", options),
  
}).addTo(this.map);

  //this.route = control.onAdd(this.map);
  }

}
