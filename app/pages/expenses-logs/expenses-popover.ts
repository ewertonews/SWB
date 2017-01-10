import {Component} from '@angular/core';
import { PopoverController, ViewController } from 'ionic-angular';
import {TranslatePipe} from "ng2-translate/ng2-translate";


@Component({
  template: `
  
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Learn Ionic</button>
      <button ion-item (click)="close()">Documentation</button>
      <button ion-item (click)="close()">Showcase</button>
      <button ion-item (click)="close()">GitHub Repo</button>
    </ion-list>
  `
})
class ExpensesPopover {
  constructor(public viewCtrl: ViewController) {}

  close() {
    this.viewCtrl.dismiss();
  }
}