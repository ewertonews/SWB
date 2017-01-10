import {Component} from '@angular/core';
import { Storage, SqlStorage, ToastController, ViewController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {ViewChild} from '@angular/core';
//import { BudgetService } from '../orcamento/BudgetService';
//ToastController

@Component({
  templateUrl: 'build/pages/gastarModal/gastar-modal.html',
  pipes: [TranslatePipe] 
})

export class GastarModalPage {
  @ViewChild('input') myInput ;
  budgetData;
  userLang;
  cycleEndsDay: number;  
  budgetEndsOption: number;
  today = new Date();
  budgetEndsDate;
  //budgetEndsDate = new Date().toISOString();
  settingsInfo: {cycleEndsDay: number, budgetEndsOption: number, budgetEndsDate: any};
  toastMessage;

  constructor(private toastCtrl: ToastController, private viewCtrl: ViewController) { //
              
       this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});       
       //this.setFocusInput();
       
  }

  ionViewLoaded() {
      setTimeout(() => {
        this.myInput.setFocus();
      },150);
  }
  
  
  closeThis(){
    this.viewCtrl.dismiss();
    //console.log(this.myInput.value);
  }

  gastar(value: number){
    //this._budgetService.gastar(value);
    this.viewCtrl.dismiss(this.myInput.value);
  }

  // setFocusInput(){
  //   input.setFocus();
  // }
}
