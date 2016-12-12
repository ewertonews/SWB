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
  monthSelection;
  
  constructor(public navCtrl: NavController) {
      this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
      this.monthSelection = new Date().getMonth();
  }

  ionViewDidEnter(){                       
       this.budgetData.get('savings').then((savings) => {
         if (savings){
           this.savings = JSON.parse(savings);          
           console.log("savings: "+ JSON.stringify(savings));
         }          
        });
  }

  getSavings(): string{
     let savingsTotal:number = 0;
      if (this.savings){
        this.savings.forEach(savings => {
         savingsTotal = savingsTotal + savings.amount;
        });
      }
      return savingsTotal.toFixed(2);     
  }

  getMonthSavings(mon:number): string{
     let savingsTotal:number = 0;
      if (this.savings){
        this.savings.forEach(savings => {
         if (savings.month == mon){
            savingsTotal = savingsTotal + savings.amount;
         }       
        });
      }
      return savingsTotal.toFixed(2);     
  }
}
