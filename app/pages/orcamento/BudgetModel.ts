export class BudgetModel{
    weeklyBudget: Array<{dias: Array<number>, amount: number, month: number, initWeekAmount: number, spentThisWeek: number, wId: number}> //<[number[], number]>; //[1,2,3,4,5,6], 150.00   
    balance: number;                   
    //savings : Array<{month: number, amount: number}>//<[number, number]> //amount, month
    
    constructor(){        
        this.balance = 0;
        this.weeklyBudget = new Array<{dias: Array<number>, amount: number, month: number, initWeekAmount: number, spentThisWeek: number, wId: number}>();
        //this.savings = new Array<{month: number, amount: number}>();
    }
}

