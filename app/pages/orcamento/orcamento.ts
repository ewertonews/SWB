import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
  templateUrl: 'build/pages/orcamento/orcamento.html',
  pipes: [TranslatePipe]
})
export class OrcamentoPage {
  
  curr_balance: number = 0.00;
  
  constructor(public navCtrl: NavController, public alerCtrl: AlertController) {
  
  }

  editBalance(){
    let prompt = this.alerCtrl.create({      
      message: "Edit balance",
      inputs: [        
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
            console.log(data);
            this.curr_balance = data.Amount;
          }
        }
      ]
    });
    prompt.present();
  }

  spend(){
    let prompt = this.alerCtrl.create({      
      message: "Amount spent:",
      inputs: [        
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
            console.log(data);
            this.curr_balance = this.curr_balance - data.Amount;
          }
        }
      ]
    });
    prompt.present();
  }
}
