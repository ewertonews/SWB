import { Component } from '@angular/core';
import { NavController, AlertController, Storage, SqlStorage, ToastController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import { BudgetService } from './BudgetService';
import { BudgetModel } from './BudgetModel';
import {AdMob} from 'ionic-native';
//.weeklyBudget

@Component({
  templateUrl: 'build/pages/orcamento/orcamento.html',
  pipes: [TranslatePipe],
  providers: [BudgetService]
})
export class OrcamentoPage {
  private admobId: any;
  budget;
  budgetData;
  init = 0;
  currMonth;  
  expensesRecord : Array<{value: string, dateTime: string, long: string, lat: string}>;
  msgSavedMoney: string;
  public press: number = 0;
  public tap: number = 0;

  constructor(public navCtrl: NavController, public alerCtrl: AlertController, public toastCtrl: ToastController, public _budgetService: BudgetService) {
    this.showAd();
    this.currMonth = (new Date().getMonth()).toString(); 
    this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});    
    this.expensesRecord = new Array<{value: string, dateTime: string, long: string, lat: string}>();
    this.init = 1;

    this.budget = new BudgetModel();

    this.budgetData.get('userBudget').then((budget) =>{
        console.log("budget salvo no db: "+JSON.stringify(budget))
        if(budget){
          this.budget =JSON.parse(budget);
        }        
    })    
        
   
    console.log("initial Saved budget: "+JSON.stringify(this.budget));
    if(this.budget.balance == "0"){
      this.budget.weeklyBudget = [];
    }

     this.budgetData.get('expenses').then((expense) =>{
       if(expense){
         console.log("tem expenses");
         this.expensesRecord = JSON.parse(expense);
       }
     });   
  }
  ionViewDidEnter(){
      this.budgetData.get('userBudget').then((budget) =>{
        if(!budget)return;
        let tempBudget = JSON.parse(budget);
        console.log("saldo do tempBudget: "+ tempBudget.balance);

        if (this.init > 0 && tempBudget != null  && this.budget.balance != tempBudget.balance){
          //console.log("AFTER PAYING BILL: "+ JSON.stringify(tempBudget));
          //console.log("Valor que vai ser enviado pra o calculateBudget: "+ tempBudget.balance);
          this.budget = this._budgetService.calculateBudget(tempBudget.balance);     
        }

        if (tempBudget != null){
          let weeksArray = []
          tempBudget.weeklyBudget.forEach(wb => {
           weeksArray.push(wb.dias);
          });
          let todaysDate = new Date().getDate();
          console.log("todaysDate: "+ todaysDate);
          let i = 0;
          let isIn = 0;          

          while(i < weeksArray.length && isIn == 0){
            if(weeksArray[i].indexOf(todaysDate) > -1){
                isIn++;
            }
            if (isIn == 0){
              i++;
            }            
          }

          // console.log("iiiiii:"+i);
          if(i > 0){          
            let lastWeekbalance = tempBudget.weeklyBudget[i-1].amount;

            if (lastWeekbalance != 0){
              if(lastWeekbalance > 0){
                let alert = this.alerCtrl.create();
                alert.setTitle("Great! You saved money from last week! \\o/ What do you wanna do?");

                alert.addInput({
                  type: 'radio',
                  label: 'Add to current week',
                  value: '1',
                  checked: true
                });
                
                alert.addInput({
                  type: 'radio',
                  label: 'Share with all remaining weeks',
                  value: '2',
                  checked: false
                });

                alert.addInput({
                  type: 'radio',
                  label: 'Add to savings',
                  value: '3',
                  checked: false
                });

                alert.addButton('Decide Later');
                alert.addButton({
                  text: 'OK',
                  handler: data => {

                    switch (data) {
                      case "1":
                         this.budget = this.addFromLastWeekToThisWeekOnly(lastWeekbalance, i);                      
                        //
                      break;
                      case "3":
                        let newBudget  = this.addToSavings(lastWeekbalance, this.currMonth);

                        console.log("budget retornado to metodo save no BudgetService: "+ JSON.stringify(newBudget))

                        newBudget.weeklyBudget[i-1].amount = 0;
                        newBudget.balance = newBudget.balance - lastWeekbalance;
                        this.budgetData.set('savings', JSON.stringify(newBudget));
                        
                        this.budgetData.set('userBudget', JSON.stringify(newBudget));

                         console.log("budget após economia: "+ JSON.stringify(newBudget))
                        break;                    
                      default:
                        break;
                    }
                  }
                });
                alert.present();
                console.log("Sobrou dinheiro! Uhuuuuu! " + lastWeekbalance);
              }else{
                console.log("Você gastou mais que deveria :(! " + lastWeekbalance);
              }
            }
            
          }         
        }      

      })              
    }

  recalculate(){

    this.budget = this._budgetService.calculateBudget(this.budget.balance);
  }

  editBalance(){
    let prompt = this.alerCtrl.create({      
      message: "Edit balance",
      inputs: [        
        {
          name: 'Amount',
          placeholder: 'Amount',
          type: 'number',
          value: this.budget.balance
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
            this.budget = this._budgetService.calculateBudget(data.Amount);
            
            // this.budgetData.get('userBudget').then((savedBudget) =>{
            //   console.log("Saved budget: "+savedBudget);
            //   this.budget.weeklyBudget = JSON.parse(savedBudget).weeklyBudget;
            //   this.budget.balance = JSON.parse(savedBudget).balance;
            //   this.budgetData.set('userBudget', JSON.stringify(this.budget));
            // });
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
                b.amount = parseFloat(b.amount) - parseFloat(data.Amount);
                return b;
              }
            });
            
              console.log("budget after map"+ JSON.stringify(this.budget));
              
            //this.curr_balance = this.curr_balance - data.Amount;
            this.budget.balance = parseFloat((this.budget.balance - data.Amount).toString());
            
            this.budgetData.set('userBudget', JSON.stringify(this.budget));
           
            let v : string = (parseFloat(data.Amount)).toFixed(2);

            this.expensesRecord.push({value: v, dateTime: today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear() + " " + today.getHours() +":"+ today.getMinutes(), long: "", lat: ""});

            this.budgetData.set('expenses', JSON.stringify(this.expensesRecord));

            console.log(this.expensesRecord);

            console.log("=================>"+JSON.stringify(this.budget));
          }
        }
      ]
    });
    prompt.present();
  }

  addToSavings(amount:number, month:number): BudgetModel{
    try {
      let newBudget = this._budgetService.save(month, amount);
      
      let toast = this.toastCtrl.create({
        message: 'Great! you\'ve saved some money! \o/',
        duration: 3000
      });
      toast.present();
      
      return newBudget;

    } catch (error) {
      let toast = this.toastCtrl.create({
        message: 'Oh snaps! something went wrong :(',
        duration: 3000
      });
      toast.present();
    }
    
  }

  addFromLastWeekToThisWeekOnly(amount: number, weekIndex: number) {
    return this._budgetService.addFromLastWeekToThisWeekOnly(amount, weekIndex);    
  }

  getAmountPerDay(e, wb, days: Array<number>){
     this.tap++;
     if(this.tap == 2){
      //  console.log("tapped " + this.tap + "! :D");
      //  console.log();
      //  console.log(days);

       let alert = this.alerCtrl.create();
       alert.setTitle("Amount per day:");
       alert.setSubTitle((wb/days.length).toFixed(2));
       alert.present();
       this.tap = 0;
     }     
  }

  showOptionsManageMoney(){
    this.press++;
    if(this.press == 1){
       let alert = this.alerCtrl.create();
       alert.setTitle("Manage this week's money");
       alert.present();
       this.press = 0;
    }
  }

  showAd(){

  
    if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
      this.admobId = {
        banner: 'ca-app-pub-7960549698264832~3390669506', // or DFP format "/6253334/dfp_example_ad"
        interstitial: 'ca-app-pub-7960549698264832/4867402707'
      };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
      this.admobId = {
        banner: 'ca-app-pub-7960549698264832~3390669506', // or DFP format "/6253334/dfp_example_ad"
        interstitial: 'ca-app-pub-7960549698264832/4867402707'
      };
    } else { // for windows phone
      this.admobId = {
        banner: 'ca-app-pub-7960549698264832~3390669506', // or DFP format "/6253334/dfp_example_ad"
        interstitial: 'ca-app-pub-7960549698264832/4867402707'
      };
    }

    if(AdMob) {
      AdMob.createBanner({
        adId: this.admobId.banner,
        isTesting: true,
        autoShow: true
      });            
    }
  }
}
