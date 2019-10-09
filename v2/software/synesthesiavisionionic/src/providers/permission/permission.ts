import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';

/*
  Generated class for the PermissionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PermissionProvider {

	private permissionsNeeded: any =  [
		this.permissions.PERMISSION.ACCESS_FINE_LOCATION,
		this.permissions.PERMISSION.ACCESS_COARSE_LOCATION,
		this.permissions.PERMISSION.INTERNET
	];

	constructor(public http: HttpClient, public permissions: AndroidPermissions) {
		console.log('Hello PermissionProvider Provider');
	}

	getPermissions(){

        this.permissionsNeeded.forEach(element => {

            this.permissions.checkPermission(element).then((result) => {

                console.log(result + ' has permission? ' + result.hasPermission);

                if(!result.hasPermission){
                    console.log('Entrou no request Permission');
                    this.permissions.requestPermission(result).then((success) => {
                        console.log('requested :' + success);
                    }, (err) => {
                        console.log('Requested Error: ' + err);
                        
                    });
                }
    
                console.log(result + ' has permission? ' + result.hasPermission);
            }, (err) => {
    
                console.log('Error occuried: ' + err);
            }).catch((err) => {
               
                console.log('Could not handle checkPermission Promise. ' + err);
            });
            
        });
	}

}
