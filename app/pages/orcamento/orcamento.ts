import { Component } from '@angular/core';
import { NavController, AlertController, Storage, SqlStorage } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import { BudgetService } from './BudgetService';
import { BudgetModel } from './BudgetModel';
//.weeklyBudget

@Component({
  templateUrl: 'build/pages/orcamento/orcamento.html',
  pipes: [TranslatePipe],
  providers: [BudgetService]
})
export class OrcamentoPage {
  
  budget;
  budgetData;
  init = 0;
  

  constructor(public navCtrl: NavController, public alerCtrl: AlertController, public _budgetService: BudgetService) {
    this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});    
    
    this.budgetData.get('userBudget').then((budget) =>{
        console.log("budget salvo no db: "+JSON.stringify(budget))
        this.budget =JSON.parse(budget);
    })    
     console.log(this.budget)
    if (this.budget == null || this.budget === undefined){
      console.log("entrou no if")
      this.budget = new BudgetModel();
    }
    this.init = 1;
    console.log("initial Saved budget: "+JSON.stringify(this.budget));
    if(this.budget.balance == "0"){
      this.budget.weeklyBudget = [];
    }
    
  }
  ionViewDidEnter(){   
      this.budgetData.get('userBudget').then((budget) =>{
        let tempBudget = JSON.parse(budget);
        console.log("saldo do tempBudget: "+ tempBudget.balance);

        if (this.init > 0 && tempBudget != null  && this.budget.balance != tempBudget.balance){
        console.log("AFTER PAYING BILL: "+ JSON.stringify(tempBudget));
        console.log("Valor que vai ser enviado pra o calculateBudget: "+ tempBudget.balance);
        
        
        this.budget = this._budgetService.calculateBudget(5, tempBudget.balance);     
      }
      })              
    }

  editBalance(){
    let prompt = this.alerCtrl.create({      
      message: "Edit balance",
      inputs: [        
        {
          name: 'Amount',
          placeholder: 'Amount',
          type: 'number'
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
            //console.log(data);
            // this.curr_balance = data.Amount;                       
            this._budgetService.calculateBudget(5, data.Amount);
            
            this.budgetData.get('userBudget').then((savedBudget) =>{
              console.log("Saved budget: "+savedBudget);
              this.budget.weeklyBudget = JSON.parse(savedBudget).weeklyBudget;
              this.budget.balance = JSON.parse(savedBudget).balance;
              this.budgetData.set('userBudget', JSON.stringify(this.budget));
            });
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
          type: 'number'
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
            
            let today = new Date();
            let day = today.getDate(); 
            let BreakException = {};
            
            this.budget.weeklyBudget.map(function(b){
              if (b.dias.indexOf(day) > -1){
                console.log(b.amount);
                console.log(data.amount);
                b.amount = (parseFloat(b.amount) - parseFloat(data.Amount)).toFixed(2);
                return b;
              }
            });
            
              console.log("budget after map"+ JSON.stringify(this.budget));
              
            //this.curr_balance = this.curr_balance - data.Amount;
            this.budget.balance = this.budget.balance - data.Amount;
            
            this.budgetData.set('userBudget', JSON.stringify(this.budget));
            // console.log("=================> (before calc)"+JSON.stringify(this.budget));
            
            // this._budgetService.spend(data.Amount);
            // this.budgetData.get('userBudget').then((savedBudget) =>{
            //   this.budget = JSON.parse(savedBudget);     
            //   console.log("budget retrieved from db: "+JSON.stringify(this.budget));         
            // });
            console.log("=================>"+JSON.stringify(this.budget));
          }
        }
      ]
    });
    prompt.present();
  }
}
