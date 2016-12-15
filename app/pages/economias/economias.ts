import { Component } from '@angular/core';
import { NavController, Storage, SqlStorage } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
  templateUrl: 'build/pages/economias/economias.html',
  pipes: [TranslatePipe]
})
export class EconomiastPage {
  budgetData;
  savings;
  constructor(public navCtrl: NavController) {
      this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});    

  }

  ionViewDidEnter(){                       
       this.budgetData.get('savings').then((saving) => {
          this.savings = saving;
          console.log("savings: "+ JSON.stringify(saving));
        });
  }
}
