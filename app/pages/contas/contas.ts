import {TranslatePipe} from "ng2-translate/ng2-translate";
import { Component } from '@angular/core';
import { NavController, AlertController, Storage, SqlStorage } from 'ionic-angular';
import { ListaContas } from './lista_de_contas';
import { BudgetModel } from '../orcamento/BudgetModel';

@Component({
  templateUrl: 'build/pages/contas/contas.html',
  pipes: [TranslatePipe]  
})
export class ContasPage {  
  budgetData;
  budget;
  init = 0;
  ListaDeContas: Array<ListaContas>;
  constructor(public navCtrl: NavController, public alerCtrl: AlertController) {
    this.ListaDeContas = new Array<ListaContas>();    
    this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
    this.init = 1;

    this.budget = new BudgetModel(); 
    this.budgetData.get('userBudget').then((savedBudget) =>{
              //console.log("fez a consulta");
              this.budget = JSON.parse(savedBudget);
              //console.log("retrieved budget: "+ savedBudget);              
            });

    this.budgetData.get('billList').then((savedBills) =>{
              console.log("fez a consulta de bills");
              if (savedBills === undefined){
                console.log("TABELA DE CONTAS TÁ VAZIA!");
              }else{
                this.ListaDeContas = JSON.parse(savedBills);
              }
              console.log("retrieved bills : "+ savedBills);               
            });
  }


  ionViewDidEnter(){
    this.budgetData.get('userBudget').then((savedBudget) =>{
             let tempBudget = JSON.parse(savedBudget);
                         
             if (this.init > 0  && tempBudget.balance != this.budget.balance){               
               this.budgetData.get('userBudget').then((updatedBudget) =>{
                 this.budget = JSON.parse(updatedBudget);                 
               });
             }             
          });

  }


  addToBillsList(title: string, valuee: number){
    let lista_contas: ListaContas = new ListaContas();
    lista_contas.bill_title = title;
    lista_contas.bill_amount = valuee;
    lista_contas.bill_isPaid = false;
    this.ListaDeContas.push(lista_contas);
    console.log(JSON.stringify(this.ListaDeContas));
    this.budgetData.set('billList', JSON.stringify(this.ListaDeContas))
  }

  getBillsTotal() : number {
    var total: number = 0;
    this.ListaDeContas.forEach(bill => {
      total -= -bill.bill_amount;
    });
    return total;
  }

  setPaid(ischecked, bill){
    
    console.log(ischecked)    
    let index = this.ListaDeContas.indexOf(bill);
    this.ListaDeContas[index].bill_isPaid = ischecked;
    if (this.ListaDeContas[index].bill_isPaid){
      this.budgetData.get('userBudget').then((savedBudget) =>{
        this.budget = JSON.parse(savedBudget);
        this.budget.balance = (parseFloat(this.budget.balance) - parseFloat(bill.bill_amount)).toFixed(2);
        this.budgetData.set('userBudget', JSON.stringify(this.budget));
      });
    }else{
      this.budgetData.get('userBudget').then((savedBudget) =>{
        this.budget = JSON.parse(savedBudget);
        this.budget.balance = (parseFloat(this.budget.balance) + parseFloat(bill.bill_amount)).toFixed(2);
        this.budgetData.set('userBudget', JSON.stringify(this.budget));
      });      
    }
    this.budgetData.set('billList', JSON.stringify(this.ListaDeContas));
    console.log(this.budget); 
  }

  addBill(){    
    let prompt = this.alerCtrl.create({
      title: 'Add a bill',
      message: "Enter the name and value of the bill",
      inputs: [
        {
          name: 'BillTitle',
          placeholder: 'New Bill'
        },
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
            this.addToBillsList(data.BillTitle, data.Amount);
          }
        }
      ]
    });
    prompt.present();
  }

  removeBill(bill){
    console.log(bill);
    let index = this.ListaDeContas.indexOf(bill);

    if(index > -1){
      this.ListaDeContas.splice(index, 1);
      this.budgetData.set('billList', JSON.stringify(this.ListaDeContas));
  }
}
  
}
