import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RotasPage } from './rotas';

@NgModule({
  declarations: [
    RotasPage,
  ],
  imports: [ 
    FormsModule,  
    IonicPageModule.forChild(RotasPage),
  ],
})
export class RotasPageModule {}
