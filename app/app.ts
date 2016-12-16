import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS} from '@angular/http';
import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {Component, ViewChild, enableProdMode} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav, Storage, SqlStorage, ModalController} from 'ionic-angular';
import {StatusBar, AdMob} from 'ionic-native';
import {ConfiguracoesPage} from './pages/configuracoes/configuracoes';
import {TabsPage} from './pages/tabs/tabs';
import {ListPage} from './pages/list/list';
import {ExpensesLogsPage} from './pages/expenses-logs/expenses-logs';


enableProdMode();

@Component({
  templateUrl: 'build/app.html',  
})
class MyApp {
  @ViewChild(Nav) nav: Nav;
  
  // make HelloIonicPage the root (or first) page
  rootPage: any = TabsPage;
  pages: Array<{title: string, component: any}>;
  // cycleEndsDay: number;  
  // budgetEndsOption: number;
  // budgetEndsDate: any;
  // settingsInfo: {cycleEndsDay: number, budgetEndsOption: number, budgetEndsDate: any};
  settingsTitle;
  budgetData;
  userLang;
  expensesRecord;
  settingsInfo: {cycleEndsDay: number, budgetEndsOption: number, budgetEndsDate: any};
  cycleEndsDay: number;  
  budgetEndsOption: number;
  today = new Date();
  budgetEndsDate;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    private  translate: TranslateService,
    public modalCtrl: ModalController
  ) {    
    
    
    this.userLang = navigator.language.split("-")[0];
    this.settingsTitle = "Settings";

    if (this.userLang == "pt"){
      this.settingsTitle = "Configurações";
    }
    
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: this.settingsTitle, component: ConfiguracoesPage },
      { title: 'Expenses log', component: ExpensesLogsPage }
    ];
    this.translateConfig();
  }

  initializeApp() {
    this.platform.ready().then(() => {

       
  

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});  
      this.initSettings();
    });
  }

  openPage(page) {
    console.log("will try to open the page..");
    console.log(this.expensesRecord);
    
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    //this.nav.setRoot(page.component);
    console.log(page);
    switch (page.title) {
      case "Expenses log":
         this.budgetData.get('expenses').then((expenses) =>{        
            if (expenses){
                this.expensesRecord =JSON.parse(expenses);
            }   
            let xpenseLogModal = this.modalCtrl.create(ExpensesLogsPage, { expensesRecord: this.expensesRecord });
            xpenseLogModal.present();
        });
        break;
      case this.settingsTitle:
        let settingsModal = this.modalCtrl.create(ConfiguracoesPage);
        settingsModal.present();
      break;
      default:
        break;
    }
   
    
    // this.nav.push(ExpensesLogsPage, {
    //   expensesRecord: this.expensesRecord
    // });
  }

  initSettings(){
    this.budgetData.get('settingsInfo').then((settings) =>{  
        console.log("Retrieved settings: ");
        console.log(settings);         
        if(!settings){
          this.cycleEndsDay = 6;
            this.budgetEndsOption = 0;
            let today = new Date();
            this.budgetEndsDate = new Date(today.getFullYear() + "-"+ Number(today.getMonth() + 1)+"-"+today.getDate()+ " 00:00:00").toISOString();
            this.settingsInfo = {cycleEndsDay: this.cycleEndsDay, budgetEndsOption: this.budgetEndsOption, budgetEndsDate: this.budgetEndsDate};
            this.budgetData.set('settingsInfo', JSON.stringify(this.settingsInfo));
        }      
      });
  }
  
  translateConfig() {
    var userLang = navigator.language.split('-')[0]; // use navigator lang if available
    userLang = /(pt|en)/gi.test(userLang) ? userLang : 'pt';
 
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
 
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(userLang);
  }
}


ionicBootstrap(MyApp, [[provide(TranslateLoader, {
  useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
  deps: [Http]
}),
  TranslateService]], {tabsPlacement: 'top', tabsHighlight: 'true'} 
);


