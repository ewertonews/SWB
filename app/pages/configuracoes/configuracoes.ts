import {Component} from '@angular/core';


@Component({
  templateUrl: 'build/pages/configuracoes/configuracoes.html'
})
export class ConfiguracoesPage {

  cycleEndsDay: number;
  optionsList: Array<{ value: number, text: string, checked: boolean }> = [];
  budgetEndsOption: number;
  budgetEndsDate;
  settingsInfo: {cycleEndsDay: number, budgetEndsOption: number, budgetEndsDate: any};

  constructor() {
      this.cycleEndsDay = 0;
      this.budgetEndsOption = 0;
      this.budgetEndsDate = new Date().toISOString().substring(0,10);
      this.settingsInfo = {cycleEndsDay: this.cycleEndsDay, budgetEndsOption: this.budgetEndsOption, budgetEndsDate: this.budgetEndsDate};
  }

  saveSettings(){
    this.settingsInfo.cycleEndsDay = this.cycleEndsDay;
    this.budgetEndsOption = this.budgetEndsOption;
    this.budgetEndsDate = this.budgetEndsDate;
    if (this.budgetEndsOption != 2){
      this.settingsInfo.budgetEndsDate = "";
    }
  }
}
