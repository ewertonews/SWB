import {Page} from 'ionic-angular';
import { Component } from '@angular/core';
import { OrcamentoPage } from '../orcamento/orcamento';
import { ContasPage } from '../contas/contas';
import { EconomiastPage } from '../economias/economias';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Page({
  templateUrl: 'build/pages/tabs/tabs.html',
  pipes: [TranslatePipe]
})
export class TabsPage {

  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = ContasPage;
    this.tab2Root = OrcamentoPage;
    this.tab3Root = EconomiastPage;
    
  }
}