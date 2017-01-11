import { Component } from '@angular/core';
import { NavController, ViewController, AlertController, Storage, SqlStorage, ToastController, Platform,  ActionSheetController, ModalController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import { BudgetService } from './BudgetService';
import { BudgetModel } from './BudgetModel';
import {AdMob} from 'ionic-native';
import {GastarModalPage} from '../gastarModal/gastar-modal';
//.weeklyBudget

@Component({
  templateUrl: 'build/pages/orcamento/orcamento.html',
  pipes: [TranslatePipe],
  providers: [BudgetService]
})
export class OrcamentoPage {
  decideLater: number;
  private admobId: any;
  budget;
  budgetData;
  init = 0;
  currMonth;  
  expensesRecord : Array<{value: string, dateTime: string, long: string, lat: string}>;
  msgSavedMoney: string;
  public press: number = 0;
  public tap: number = 0;

  constructor(
      public navCtrl: NavController, 
      public alerCtrl: AlertController, 
      public toastCtrl: ToastController, 
      public _budgetService: BudgetService,
      private platform: Platform,
      public actionsheetCtrl: ActionSheetController,
      public modalCtrl: ModalController
     ) {
    //this.showAd();
    this.currMonth = (new Date().getMonth()).toString(); 
    this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});    
    this.expensesRecord = new Array<{value: string, dateTime: string, long: string, lat: string}>();
    this.init = 1;
    this.decideLater = 0;
    this.budget = new BudgetModel();

    this.budgetData.get('userBudget').then((budget) =>{
        console.log("budget salvo no db: "+JSON.stringify(budget))
        if(budget){
          this.budget =JSON.parse(budget);
        }        
    });    
        
   
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

        if (this.init > 0 && tempBudget != this.budget){
          //need fix  
        }

        // if(this.budget != budget){
        //   this.budget = budget;
        // }

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
            
            if (lastWeekbalance != 0 && this.decideLater == 0){
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

                alert.addButton({
                  text: 'Decide Later',
                  handler: ()=>{
                    this.decideLater = 1;
                  }
                });
                alert.addButton({
                  text: 'OK',
                  handler: data => {
                    switch (data) {
                      case "1":
                         this._budgetService.addFromLastWeekToThisWeekOnly(lastWeekbalance, i).then((budget) => {
                           this.budget = budget;
                         });                      
                        //
                      break;
                      case "2":
                        this._budgetService.addFromLastWeekToRemainingWeeks(lastWeekbalance, i).then((budget) => {
                           this.budget = budget;
                         });  
                      break;
                      case "3":
                      try {
                        this._budgetService.save(lastWeekbalance, i).then((budget) => {
                            this.budget = budget;               
                            this.budgetData.set('userBudget', JSON.stringify(budget));
                            let toast = this.toastCtrl.create({
                              message: 'Great! you\'ve saved some money! \o/',
                              duration: 1200
                            });
                          this.decideLater = 0;
                          toast.present();
                        });
                      } catch (error) {
                        let toast = this.toastCtrl.create({
                        message: 'Oh snaps! something went wrong :(',
                        duration: 1200
                      });
                      toast.present();
                      }                        
                        
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
    this._budgetService.calculateBudget(this.budget.balance).then((budget) => {
      this.budget = budget;
    });
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
           this._budgetService.calculateBudget(data.Amount).then((budget) => {
              this.budget = budget;
           });
   
          }
        }
      ]
    });
    prompt.present();
  }

  spend(){
    
    let gastarModal = this.modalCtrl.create(GastarModalPage);
    gastarModal.present();

    gastarModal.onDidDismiss(val => {
      if(val){
        console.log("val do input: " + val);
        let today = new Date();
        let day = today.getDate(); 
        let BreakException = {};
        
        this.budget.weeklyBudget.map(function(b){
          if (b.dias.indexOf(day) > -1){
      
            b.amount = parseFloat(b.amount) - parseFloat(val);
            b.spentThisWeek = parseFloat(b.spentThisWeek) + parseFloat(val);
            return b;
          }
        });
      
        console.log("budget after map"+ JSON.stringify(this.budget));
                
        //this.curr_balance = this.curr_balance - data.Amount;
        this.budget.balance = parseFloat((this.budget.balance - val).toString());
              
        this.budgetData.set('userBudget', JSON.stringify(this.budget));
            
        let v : string = (parseFloat(val)).toFixed(2);

        this.expensesRecord.push({value: v, dateTime: today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear() + " " + today.getHours() +":"+ today.getMinutes(), long: "", lat: ""});

        this.budgetData.set('expenses', JSON.stringify(this.expensesRecord));

        console.log(this.expensesRecord);

        console.log("=================>"+JSON.stringify(this.budget));
      }      
    });
    /*
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
                b.spentThisWeek = parseFloat(b.spentThisWeek) + parseFloat(data.Amount);
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
    */
  }

  
  getFixed2Amount(value: number){
    if (value){
      return value.toFixed(2);
    }
  }
  

  getBudgetSummary(e, spentThisWeek, initWb, days: Array<number>){
     this.tap++;
     if(this.tap == 2){
       let today = new Date();
       let todaysDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
       let totalSpent = 0;
       this.expensesRecord.forEach((exp) => {
         if(exp.dateTime.split(' ')[0] == todaysDate){
           totalSpent = totalSpent + Number(exp.value);
         }
       });
       let alert = this.alerCtrl.create();
       alert.setTitle("Resumo desta semana");

       let limiteDiário = (initWb/days.length).toFixed(2);
       let gastoHoje = totalSpent.toFixed(2);
       let gastoEstaSemana = spentThisWeek.toFixed(2);

       let mensagem = "Limite Diário: " + (initWb/days.length).toFixed(2) + 
       "<br>Gasto hoje: "+ gastoHoje + "<br>Gasto esta semana: " + gastoEstaSemana;
     
       //alert.setSubTitle();
       alert.setMessage(mensagem);      
       alert.present();
       this.tap = 0;
     }     
  }

  handleMoney(){
    return new Promise(resolve => {
      let prompt = this.alerCtrl.create({      
              message: "Valor:",
              inputs: [        
                {
                  name: 'amount',
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
                  text: 'Ok',
                  handler: data => {}
                } 
              ]
            });
            prompt.present();
    });
  }

  showOptionsManageMoney(e, weekbudget){
    this.press++;
    if(this.press == 1){
      let remainingWeeks = this.budget.weeklyBudget.length - weekbudget.wId;
      let actionSheet = this.actionsheetCtrl.create({
        title: 'Gerenciar orçamento da semana selecionada',
        cssClass: 'action-sheets-basic-page',
        buttons: [        
          {
            text: 'Economizar',
            icon: !this.platform.is('ios') ? 'archive' : null,
            handler: () => {
              console.log('Favorite clicked');
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel', // will always sort to be on the bottom
            icon: !this.platform.is('ios') ? 'close' : null,
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      if (remainingWeeks >= 1){
        actionSheet.addButton({
            text: 'Enviar para próxima semana',
            icon: !this.platform.is('ios') ? 'arrow-dropdown-circle' : null,
            handler: () => {
              console.log('Delete clicked');
            }
          });
          actionSheet.addButton({
            text: 'Trazer da próxima semana',
            icon: !this.platform.is('ios') ? 'arrow-dropup-circle' : null,
            handler: () => {
             let navTransition = actionSheet.dismiss();
             this.handleMoney().then(() => {
                // once the async operation has completed
                // then run the next nav transition after the
                // first transition has finished animating out

                navTransition.then(() => {
                  this.navCtrl.pop();
                });
              });
              //return false;
            }
          });
      }
      if(remainingWeeks >= 2){
        actionSheet.addButton({
          text: 'Trazer das semanas restantes ',
            icon: !this.platform.is('ios') ? 'arrow-round-up' : null,
            handler: () => {
              console.log('Play clicked');
            }
        });
        actionSheet.addButton({
          text: 'Enviar para semanas restantes',
            icon: !this.platform.is('ios') ? 'arrow-round-down' : null,
            handler: () => {
              console.log('Delete clicked');
            }
        });
      }
      actionSheet.present();
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
    this.platform.ready().then(() => {
      if(AdMob) {
      AdMob.createBanner({
        adId: this.admobId.banner,
        isTesting: true,
        autoShow: true
      });            
      }
    });
    
  }
}
