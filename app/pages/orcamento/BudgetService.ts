import { BudgetModel} from './BudgetModel';
import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

@Injectable()
export class BudgetService {
    
    userBudget: BudgetModel;
    budgetData;
    budgetSettings;
    savings : Array<{month: number, amount: number}>;
    expensesRecord : Array<{value: string, dateTime: string, long: string, lat: string}>;
    constructor() {
        this.userBudget = new BudgetModel();
        this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
        this.savings = new Array<{month: number, amount: number, year: number}>();
        
        this.budgetData.get('userBudget').then((budget) => {
            console.log("budget salvo no db: "+JSON.stringify(budget))
            if(budget){
                this.userBudget =JSON.parse(budget);
            }        
        });    

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

        this.budgetData.get('expenses').then((expense) =>{
            if(expense){
                console.log("tem expenses");
                this.expensesRecord = JSON.parse(expense);
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

    //not used
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
                                    
    private getDateOfLastBusDay(lastDayOfMonth : Date) : Date
    {
        if (this.getDayOfWeek(lastDayOfMonth.getDay()) == "Sunday" || this.getDayOfWeek(lastDayOfMonth.getDay()) == "Saturday")
        {
            return this.getDateOfLastBusDay(this.addDays(lastDayOfMonth, -1));
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

    //not used
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
                endOfMonthlyBudget = this.getDateOfLastBusDay(this.getLastDayOfMonth());
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
       let weekId = 1; 
       return this.budgetData.get('settingsInfo').then((budgetSettings) => {
            this.budgetSettings = JSON.parse(budgetSettings);     

    
            this.userBudget.balance = saldo;

            let today = new Date();

            let cycleEnds: number = Number(this.budgetSettings.cycleEndsDay);            

            let dateOfEndOfBudget: Date = this.getEndOfMonthtlyCycle();

            let remainingDays = dateOfEndOfBudget.getDate() - today.getDate();

            let amountPerDay: number = saldo / (remainingDays + 1);          

            

            let budget = new Array<{dias: Array<number>, amount: number, month: number, initWeekAmount: number, spentThisWeek:number, wId: number}>();;

            let weekNbudget: number = 0;

            let weekBudget: [String, String];

            //24
            let currentDate: Date = new Date(today.getFullYear() + "-"+ Number(today.getMonth() + 1)+"-"+today.getDate()+ " 00:00:00");
            //lastDayOfMonth = 31
            let weekI = 0;
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

                budgetOfWeek =  parseFloat(String((daysOfweekN.length * amountPerDay).toFixed(2)));
                let actualSpentThisWeek: number;
                if(this.userBudget.weeklyBudget[weekI]){
                    actualSpentThisWeek =  this.userBudget.weeklyBudget[weekI].spentThisWeek;
                }                

                if (!actualSpentThisWeek){actualSpentThisWeek = 0;}

                budget.push({dias: daysOfweekN, amount: budgetOfWeek, month: today.getMonth() + 1, initWeekAmount: budgetOfWeek, spentThisWeek: actualSpentThisWeek,  wId: weekId});
                //console.log("pushed budget after calculation: "+JSON.stringify(budget))
                currentDate = this.addDays(currentDate, 1);
                weekId++;
            }

            console.log("Budget local que vai ser setado no userBudget.weekBudget: "+ JSON.stringify(budget));
            
            this.userBudget.weeklyBudget = budget;
            this.userBudget.balance = parseFloat(saldo.toString());
            this.budgetData.set('userBudget', JSON.stringify(this.userBudget));
            
            this.budgetData.get('userBudget').then((res) => {
                console.log("Budget saved to in the BudgetService (calculateBudget): "+ res);
            })

            return this.userBudget
        });
    }

    public gastar(value: number){
        let today = new Date();
        let day = today.getDate(); 
        let BreakException = {};
        
        this.userBudget.weeklyBudget.map(function(b){
            if (b.dias.indexOf(day) > -1){
            console.log(b.amount);
            
            b.amount = b.amount - value;
            b.spentThisWeek = b.spentThisWeek + value;
            return b;
            }
        });
            
        console.log("budget after map"+ JSON.stringify(this.userBudget));
            
        //this.curr_balance = this.curr_balance - data.Amount;
        this.userBudget.balance = parseFloat((this.userBudget.balance - value).toString());
        
        this.budgetData.set('userBudget', JSON.stringify(this.userBudget));
        
        let v : string = (parseFloat(value.toString())).toFixed(2);

        this.expensesRecord.push({value: v, dateTime: today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear() + " " + today.getHours() +":"+ today.getMinutes(), long: "", lat: ""});

        this.budgetData.set('expenses', JSON.stringify(this.expensesRecord));

        console.log(this.expensesRecord);

        console.log("=================>"+JSON.stringify(this.userBudget));
    }

    public save(lastWeekBalance: number, weekIndex: number) 
    {
        let month = new Date().getMonth();
        return this.budgetData.get('userBudget').then((bud) => {
        //bud.weeklyBudget[weekIndex].amount =  bud.weekBudget[weekIndex].amount + newAmount;
            this.userBudget = JSON.parse(bud);
            this.userBudget.weeklyBudget[weekIndex - 1].amount = 0;
            this.userBudget.balance = Number((this.userBudget.balance - lastWeekBalance).toFixed(2));
          
            if (this.savings.length == 0){
                this.savings.push({month: month, amount: lastWeekBalance});
            }else{
                for (var i = 0; i <  this.savings.length; i++) {            
                    if (this.savings[i].month == month){
                        this.savings[i] = {month: month, amount: this.savings[i].amount + lastWeekBalance};
                        break;
                    }
                }
            }
            this.budgetData.set('savings', JSON.stringify(this.savings));
            this.budgetData.set('userBudget', JSON.stringify(this.userBudget))
            console.log("setado novobudget depois de adicionado à semana..");
            return this.userBudget;
        });       
          
    }

    public addFromLastWeekToThisWeekOnly(newAmount: number, weekIndex: number) 
    {
    
        return this.budgetData.get('userBudget').then((bud) => {
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
            return this.userBudget;
        });       
    }

    public addFromLastWeekToRemainingWeeks(newAmount: number, weekIndex: number) 
    {
    
        return this.budgetData.get('userBudget').then((bud) => {
        //bud.weeklyBudget[weekIndex].amount =  bud.weekBudget[weekIndex].amount + newAmount;
            this.userBudget = JSON.parse(bud);
            let remainingWeeks = this.userBudget.weeklyBudget.length -  this.userBudget.weeklyBudget[weekIndex - 1].wId;
            
            let amountToShare = newAmount/remainingWeeks;            
          

            for (var weekIndex = weekIndex; weekIndex < this.userBudget.weeklyBudget.length; weekIndex++){
                this.userBudget.weeklyBudget[weekIndex].amount = amountToShare;
            }      
           
            this.userBudget.weeklyBudget[weekIndex - 1].amount = 0;           

            this.budgetData.set('userBudget', JSON.stringify(this.userBudget))
         
            return this.userBudget;
        });       
    }

    

}