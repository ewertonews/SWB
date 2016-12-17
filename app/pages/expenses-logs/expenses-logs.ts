import { Component } from '@angular/core';
import { NavController,Storage, SqlStorage, NavParams,  ViewController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";

/*
  Generated class for the ExpensesLogsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/expenses-logs/expenses-logs.html',
  pipes: [TranslatePipe]
})
export class ExpensesLogsPage {
  
  budgetData;
  expensesRecord : Array<{value: string, dateTime: string, long: string, lat: string}>;

  constructor(private navCtrl: NavController, navParams: NavParams,  public viewCtrl: ViewController) {
     this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
     this.expensesRecord = new Array<{value: string, dateTime: string, long: string, lat: string}>();
     //this.
     this.budgetData.get('expenses').then((expenses) =>{  
        
        if (expenses){
           this.expensesRecord =JSON.parse(expenses);
        }    
      });
  }
  
  closeThis(){
    this.viewCtrl.dismiss();
  }
}
