import { BudgetModel} from './BudgetModel';
import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

@Injectable()
export class BudgetService {
    
    userBudget: BudgetModel;
    budgetData;
    budgetSettings;
    savings : Array<{month: number, amount: number}>;

    constructor() {
        this.userBudget = new BudgetModel();
        this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
        this.savings = new Array<{month: number, amount: number}>();
        
        this.budgetData.get('settingsInfo').then((budgetSettings) => {
            if(budgetSettings){
                this.budgetSettings = JSON.parse(budgetSettings);
            }            
        });

         this.budgetData.get('savings').then((savings) =>{
            if(savings){
                this.savings = JSON.parse(savings);               
            }
        });
    }    

    private getDayOfWeek(dayNumber: number): string{
        let dayOfWeet = "";
        switch (dayNumber) {
            case 0:
                dayOfWeet = "Sunday"
                break;
            case 1:
                dayOfWeet = "Monday"
                break;
            case 2:
                dayOfWeet = "Tuesday"
                break;
            case 3:
                dayOfWeet = "Wednesday"
                break;
            case 4:
                dayOfWeet = "Thursday"
                break;
            case 5:
                dayOfWeet = "Friday"
                break;
            case 6:
                dayOfWeet = "Saturday"
                break;            
            default:
                dayOfWeet = "Not a Day"
                break;
        }
        return dayOfWeet;
    }

    private addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private getDateFromCycleEndsDay(cycleEndsDay: string)
    {

        let today = new Date();
        let dateOfCycleEndsDay = today.getDay();

        if (this.getDayOfWeek(today.getDay()) != cycleEndsDay)
        {
            while (this.getDayOfWeek(today.getDay()) != cycleEndsDay)
            {
                today = this.addDays(today, 1);
            }
            dateOfCycleEndsDay = today.getDate();
        }
        //data do fim do ciclo
        return dateOfCycleEndsDay;
    }
                                    //string that represents a date ("23/10/2016")
    private getdateOfEndOfBudget(lastDayOfMonth : Date) : Date
    {
        if (this.getDayOfWeek(lastDayOfMonth.getDay()) == "Sunday" || this.getDayOfWeek(lastDayOfMonth.getDay()) == "Saturday")
        {
            return this.getdateOfEndOfBudget(this.addDays(lastDayOfMonth, -1));
        }
        else
        {
            return lastDayOfMonth;
        }
    }

    private getLastDayOfMonth(): Date{
        var date = new Date();
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return lastDay;

    }

    private static GetAmountPerDay(saldo: number, start: Date, end:Date): number
    {
        var remainingDays = end.getDate() - start.getDate();

        let amountPerDay = saldo / (remainingDays + 1);
        return amountPerDay;
    }

    

    private getEndOfMonthtlyCycle(){
        let endOfMonthlyBudget: Date;
        let opt = Number(this.budgetSettings.budgetEndsOption);
        if (isNaN(opt)){
            opt = 0;
        }
        switch (opt) {
            case 0:
                endOfMonthlyBudget = this.getLastDayOfMonth();
                break;
            case 1:
                endOfMonthlyBudget = this.getdateOfEndOfBudget(this.getLastDayOfMonth());
                break;
            case 2:
                let dateString: string = this.budgetSettings.budgetEndsDate.split("T")[0] + " 00:00:00";
                endOfMonthlyBudget = new Date(dateString);
            default:
                break;
        }

        return endOfMonthlyBudget;  
    }


                            //num from 0 to 6 (sat to sund)
    public calculateBudget(saldo: number)
    {
        let podeIrMano = false;
        let i = 0;
        this.budgetData.get('settingsInfo').then((budgetSettings) => {
            this.budgetSettings = JSON.parse(budgetSettings);
           
        });

    
        console.log("Esperou poder ir... " + i);
        this.userBudget.balance = saldo;

        let today = new Date();

        let cycleEnds: number = Number(this.budgetSettings.cycleEndsDay);            

        let dateOfEndOfBudget: Date = this.getEndOfMonthtlyCycle();

        let remainingDays = dateOfEndOfBudget.getDate() - today.getDate();

        let amountPerDay: number = saldo / (remainingDays + 1);          

        let budget = new Array<{dias: Array<number>, amount: number, month: number, initWeekAmount: number}>();;

        let weekNbudget: number = 0;

        let weekBudget: [String, String];

        //24
        let currentDate: Date = new Date(today.getFullYear() + "-"+ Number(today.getMonth() + 1)+"-"+today.getDate()+ " 00:00:00");
        //lastDayOfMonth = 31
        while (currentDate <= dateOfEndOfBudget)
        {
            let budgetOfWeek = 0;
            let daysOfweekN: Array<number> = new Array<number>();
            let canProceed: boolean = false;

            do{
                daysOfweekN.push(currentDate.getDate());
                if (currentDate.getDay() != cycleEnds)
                    {
                        currentDate = this.addDays(currentDate, 1);
                        
                    }

            } while (currentDate.getDay() != cycleEnds && currentDate <= dateOfEndOfBudget)
            
            
            if (daysOfweekN.length == 1 && currentDate.getDay() == cycleEnds && today.getDate() != currentDate.getDate()){
                canProceed = true;             
            }

            if ((currentDate.getDate() == dateOfEndOfBudget.getDate() || currentDate.getDay() == cycleEnds) && (daysOfweekN.length > 1 || canProceed) ){
                if (currentDate.getDate() <= dateOfEndOfBudget.getDate()){
                    daysOfweekN.push(currentDate.getDate());    
                }                                   
            }

            budgetOfWeek =  parseFloat(String(daysOfweekN.length * amountPerDay));
            
            budget.push({dias: daysOfweekN, amount: budgetOfWeek, month: today.getMonth() + 1, initWeekAmount: budgetOfWeek});
            //console.log("pushed budget after calculation: "+JSON.stringify(budget))
            currentDate = this.addDays(currentDate, 1);
        }

        console.log("Budget local que vai ser setado no userBudget.weekBudget: "+ JSON.stringify(budget));
        
        this.userBudget.weeklyBudget = budget;
        this.userBudget.balance = parseFloat(saldo.toString());
        this.budgetData.set('userBudget', JSON.stringify(this.userBudget));
        
        this.budgetData.get('userBudget').then((res) => {
            console.log("Budget saved to in the BudgetService (calculateBudget): "+ res);
        })

        return this.userBudget
    }
        public save(month: number, amount: number) : BudgetModel
        {

            this.budgetData.get('userBudget').then((budget) => {
                this.userBudget = JSON.parse(budget);
                
                console.log("user budget retrieved when saving: " + JSON.stringify(this.userBudget));

                if (this.userBudget.savings.length == 0){
                    this.userBudget.savings[0] = {month: month, amount: amount};
                }else{
                    for (var i = 0; i <  this.userBudget.savings.length; i++) {            
                        if (this.userBudget.savings[i].month == month){
                            this.userBudget.savings[i] = {month: month, amount: this.userBudget.savings[i].amount + amount};
                            break;
                        }
                    }
                }
                if (this.savings.length == 0){
                    this.savings.push({month: month, amount: amount});
                }else{
                    for (var i = 0; i <  this.savings.length; i++) {            
                        if (this.savings[i].month == month){
                            this.savings[i] = {month: month, amount: this.savings[i].amount + amount};
                            break;
                        }
                    }
                }
                
                this.budgetData.set('savings', JSON.stringify(this.savings));          

            });      
            
            return this.userBudget    
        }

         public addFromLastWeekToThisWeekOnly(newAmount: number, weekIndex: number) 
         {
            
             this.budgetData.get('userBudget').then((bud) => {
                //bud.weeklyBudget[weekIndex].amount =  bud.weekBudget[weekIndex].amount + newAmount;
                 this.userBudget = JSON.parse(bud);
                 let newWeekBalance = this.userBudget.weeklyBudget[weekIndex].amount + newAmount;
                 
                 this.userBudget.weeklyBudget[weekIndex].amount = newWeekBalance; 
                 this.userBudget.weeklyBudget[weekIndex].initWeekAmount = newWeekBalance;
                 this.userBudget.weeklyBudget[weekIndex - 1].amount = 0;
                 console.log("novo budget:");
                 console.log( this.userBudget);

                 this.budgetData.set('userBudget', JSON.stringify(this.userBudget))
                  console.log("setado novobudget depois de adicionado à semana..");
             });
            
             
         }

}