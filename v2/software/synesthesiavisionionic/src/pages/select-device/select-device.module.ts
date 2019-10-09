import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectDevicePage } from './select-device';

@NgModule({
  declarations: [
    SelectDevicePage,
  ],
  imports: [ 
    FormsModule,  
    IonicPageModule.forChild(SelectDevicePage),
  ],
})
export class SelectDevicePageModule {}
