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
  private userLatitude : any;
  private userLongitude : any;
  private paradaLatitude : any;
  private paradaLongitude : any;

  @ViewChild('map') mapContainer: ElementRef;
  map: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation) {
    this.paradaLatitude = navParams.get('latitudeParada');
    this.paradaLongitude = navParams.get('longitudeParada');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RotasPage');
    this.getInitUserLocation();
  }

  loadmap(){
    /*console.log("Latitude: " + this.userLatitude);
    console.log("Longitude: " + this.userLongitude);
*/
    this.map = Leaflet.map("map").fitWorld();
    Leaflet.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.map.locate({
      setView: true,
      maxZoom: 16
    })

    let options = {language: 'pt-BR',
    profile: 'mapbox/walking'};

    Leaflet.Routing.control({
      waypoints: [
        Leaflet.latLng(this.userLatitude, this.userLongitude),
        Leaflet.latLng(this.paradaLatitude, this.paradaLongitude)
      ],
      /*hide: true,*/
      router: Leaflet.Routing.mapbox("pk.eyJ1IjoibGlkeWFuIiwiYSI6ImNqdG9uNHYwbTBnMXk0NG1xdTFjMnhzcW4ifQ.-JEJ9QFFoBoII-0XxGV5xg", options),
    }).addTo(this.map);
  }

  getInitUserLocation(){
      return new Promise ((resolve, reject) =>{
        this.geolocation.getCurrentPosition()
      .then((resp) => {
        this.userLatitude = resp.coords.latitude;
        this.userLongitude = resp.coords.longitude;
      }).then(()=>{
        this.loadmap();
        resolve(true);
      })
      .catch((error) => {
        console.log('Erro ao recuperar sua posição', error);
        reject(false);
      });

      })
  }

  updateUserLocation(){
    return new Promise ((resolve, reject) =>{
        this.geolocation.getCurrentPosition()
      .then((resp) => {
        this.userLatitude = resp.coords.latitude;
        this.userLongitude = resp.coords.longitude;
        resolve(true);
      })
      .catch((error) => {
        console.log('Erro ao recuperar sua posição', error);
        reject(false);
      });

      })
  }
  
}
