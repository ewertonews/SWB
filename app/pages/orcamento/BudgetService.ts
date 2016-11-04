import { BudgetModel} from './BudgetModel';
import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

@Injectable()
export class BudgetService {
    
    userBudget: BudgetModel;
    budgetData;

    constructor() {
        this.userBudget = new BudgetModel();
        this.budgetData = new Storage(SqlStorage, {name: 'SmartWeeklyBudgetDB'});
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
    private getLastBussnessDayOfMonth(lastDayOfMonth : Date) : Date
    {
        if (this.getDayOfWeek(lastDayOfMonth.getDay()) == "Sunday" || this.getDayOfWeek(lastDayOfMonth.getDay()) == "Saturday")
        {
            return this.getLastBussnessDayOfMonth(this.addDays(lastDayOfMonth, -1));
        }
        else
        {
            return lastDayOfMonth;
        }
    }

    private static GetAmountPerDay(saldo: number, start: Date, end:Date): number
    {
        var remainingDays = end.getDate() - start.getDate();

        let amountPerDay = saldo / (remainingDays + 1);
        return amountPerDay;
    }

    public save(month: number, amount: number)
    {
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
        
        return this.userBudget.savings;        
        
    }
                            //num from 0 to 6 (sat to sund)
    public calculateBudget(cycleEnds: number , saldo: number)
        {
           
            this.userBudget.balance = saldo;

            let today = new Date();

            let lastDayOfMonth: number = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

            let completeDateOfLastDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            //this must become a variable, which will be a user option from the settings page
            let lastBussnessDayOfMonth: Date = this.getLastBussnessDayOfMonth(completeDateOfLastDayOfMonth);

            let remainingDays = lastBussnessDayOfMonth.getDate() - today.getDate();

            let amountPerDay: number = saldo / (remainingDays + 1);
            //dailyBudget = amountPerDay;

            let budget = new Array<{dias: Array<number>, amount: number, month: number, initWeekAmount: number}>();;

            let weekNbudget: number = 0;
            let weekBudget: [String, String];

            //24
            let currentDate: Date = today;

            //lastDayOfMonth = 31
            while (currentDate.getDate() != lastBussnessDayOfMonth.getDate())
            {
                let budgetOfWeek = 0;
                let daysOfweekN: Array<number> = new Array<number>();
                
                do{
                    daysOfweekN.push(currentDate.getDate());
                    currentDate = this.addDays(currentDate, 1);
                } while (currentDate.getDay() <= cycleEnds && currentDate.getDate() != lastBussnessDayOfMonth.getDate())
                
                if (currentDate.getDate() == lastBussnessDayOfMonth.getDate()){
                    daysOfweekN.push(currentDate.getDate());
                }

                budgetOfWeek =  parseFloat(String(daysOfweekN.length * amountPerDay));
                
                budget.push({dias: daysOfweekN, amount: budgetOfWeek, month: today.getMonth() + 1, initWeekAmount: budgetOfWeek});         

            }

            console.log("Budget local que vai ser setado no userBudget.weekBudget: "+budget);
            
            this.userBudget.weeklyBudget = budget;
            this.userBudget.balance = parseFloat(saldo.toString());
            this.budgetData.set('userBudget', JSON.stringify(this.userBudget));
            
            this.budgetData.get('userBudget').then((res) => {
                console.log("Budget saved to in the BudgetService (calculateBudget): "+ res);
            })
            return this.userBudget
        }

   
}