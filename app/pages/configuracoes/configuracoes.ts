import {Component} from '@angular/core';
import { Storage, SqlStorage, ToastController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";

//ToastController

@Component({
  templateUrl: 'build/pages/configuracoes/configuracoes.html',
  pipes: [TranslatePipe]
})
export class ConfiguracoesPage {

  budgetData;
  userLang;
  cycleEndsDay: number;  
  budgetEndsOption: number;
  today = new Date();
  budgetEndsDate;
  //budgetEndsDate = new Date().toISOString();
  settingsInfo: {cycleEndsDay: number, budgetEndsOption: number, budgetEndsDate: any};
  toastMessage;

  constructor(private toastCtrl: ToastController) { //
       
       this.userLang = navigator.language.split("-")[0];  
       this.toastMessage = "Settings saved successfully! ;)";   
       if (this.userLang == "pt"){
         this.toastMessage = "Configurações salvas com sucesso! ;)";
       }  
       this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});       
   
       this.budgetData.get('settingsInfo').then((settings) =>{  
        console.log("Retrieved settings: ");
        console.log(settings);         
        if(settings){
          this.settingsInfo =JSON.parse(settings);
        }
        
        if (this.settingsInfo == null || this.settingsInfo === undefined){
            console.log("entrou no if.... settingsInfo null or undefined");
            this.cycleEndsDay = 6;
            this.budgetEndsOption = 0;
            let today = new Date();
            this.budgetEndsDate = new Date(today.getFullYear() + "-"+ Number(today.getMonth() + 1)+"-"+today.getDate()+ " 00:00:00").toISOString();
            this.settingsInfo = {cycleEndsDay: this.cycleEndsDay, budgetEndsOption: this.budgetEndsOption, budgetEndsDate: this.budgetEndsDate};
            this.budgetData.set('settingsInfo', JSON.stringify(this.settingsInfo));
        }else{
          this.cycleEndsDay = this.settingsInfo.cycleEndsDay;
          this.budgetEndsOption = this.settingsInfo.budgetEndsOption;
          this.budgetEndsDate = this.settingsInfo.budgetEndsDate;
          if (this.budgetEndsDate == null || this.budgetEndsDate == ""){
              this.budgetEndsDate = new Date(this.today.getFullYear() + "-"+ Number(this.today.getMonth() + 1)+"-"+this.today.getDate()+ " 00:00:00").toISOString();
          }
        }
        
      });
}

  saveSettings(){
  
    if (this.budgetEndsOption != 2){
      this.budgetEndsDate = null;
    }

    this.settingsInfo.cycleEndsDay = this.cycleEndsDay;
    this.settingsInfo.budgetEndsOption = this.budgetEndsOption;
    this.settingsInfo.budgetEndsDate = this.budgetEndsDate;

    console.log("saving the settings: "+ JSON.stringify(this.settingsInfo));

    this.budgetData.set('settingsInfo', JSON.stringify(this.settingsInfo));

           

      let toast = this.toastCtrl.create({
        message: this.toastMessage,
        duration: 2000,
        position: 'bottom'
      });

      // toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
      // });
      //alert("Salvo!");
      toast.present();  
      //console.log(this.settingsInfo.budgetEndsDate);  
  }
}
