import {TranslatePipe} from "ng2-translate/ng2-translate";
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/contas/contas.html',
  pipes: [TranslatePipe]
})
export class ContasPage {
  constructor(public navCtrl: NavController, public alerCtrl: AlertController) {
  }


  addBill(){
    let prompt = this.alerCtrl.create({
      title: 'Add a bill',
      message: "Enter the name and value of the bill",
      inputs: [
        {
          name: 'NewBill',
          placeholder: 'New Bill'
        },
        {
          name: 'Amount',
          placeholder: 'Amount',
          type: 'decimal'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }
  
}
