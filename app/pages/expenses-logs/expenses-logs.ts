import { Component } from '@angular/core';
import { NavController,Storage, SqlStorage, NavParams,  ViewController } from 'ionic-angular';

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
  expensesRecord : Array<{value: string, dateTime: string, long: string, lat: string}>;

  constructor(private navCtrl: NavController, navParams: NavParams,  public viewCtrl: ViewController) {
     this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
     this.expensesRecord = new Array<{value: string, dateTime: string, long: string, lat: string}>();
     //this.
      this.expensesRecord = navParams.get('expensesRecord');
      // this.budgetData.get('expenses').then((expenses) =>{  
        
      //   if (expenses){
      //      this.expensesRecord =JSON.parse(expenses);
      //   }        
      
      // });
  }
  
  closeThis(){
    this.viewCtrl.dismiss();
  }
}
