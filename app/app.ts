import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS} from '@angular/http';
import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {Component, ViewChild, enableProdMode} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav, Storage, SqlStorage} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
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
  budgetData;
  userLang;
  constructor(
    public platform: Platform,
    public menu: MenuController,
    private  translate: TranslateService
    
  ) {      
      
     
    this.userLang = navigator.language.split("-")[0];
    let settingsTitle = "Settings";

    if (this.userLang == "pt"){
      settingsTitle = "Configurações";
    }
    
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Home', component: TabsPage },
      { title: settingsTitle, component: ConfiguracoesPage },
      { title: 'List', component: ListPage },
      { title: 'Expenses log', component: ExpensesLogsPage }
    ];
    this.translateConfig();
  }

  initializeApp() {
    this.platform.ready().then(() => {      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
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


