import { Component } from '@angular/core';
import { NavController,Storage, SqlStorage } from 'ionic-angular';

/*
  Generated class for the ExpensesLogsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/expenses-logs/expenses-logs.html',
})
export class ExpensesLogsPage {
  
  budgetData;
  expensesRecord : Array<{value: number, dateTime: string, long: string, lat: string}>;

  constructor(private navCtrl: NavController) {
     this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
     this.expensesRecord = new Array<{value: number, dateTime: string, long: string, lat: string}>();

      this.budgetData.get('expenses').then((expenses) =>{  
        
        if (expenses){
           this.expensesRecord =JSON.parse(expenses);
        }
         
          // console.log("after setting in loc al variable:");
          // console.log(this.settingsInfo);
       
        // console.log("settingsInfo fora do get:")    
        // console.log(this.settingsInfo);
        // console.log("Vai pro if agora...")
        // if (this.expensesRecord == null || this.expensesRecord === undefined){
        //    this.expensesRecord = [];
        // }
      });
  }

}
