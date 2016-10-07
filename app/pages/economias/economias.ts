import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
  templateUrl: 'build/pages/economias/economias.html',
  pipes: [TranslatePipe]
})
export class EconomiastPage {

  constructor(public navCtrl: NavController) {
    
  }
}
