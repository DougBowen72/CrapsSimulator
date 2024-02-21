import { min } from "rxjs";
import { Common } from "./common.model";

export class ColdTable {
    private _amountOnDontPass: number = 0;
    private _amountOnDontCome: number = 0;
    private _amountOnCome: number = 0;
    private _amountOnCome4: number = 0;
    private _amountOnCome5: number = 0;
    private _amountOnCome6: number = 0;
    private _amountOnCome8: number = 0;
    private _amountOnCome9: number = 0;
    private _amountOnCome10: number = 0;
    private _amountOnDontCome4: number = 0;
    private _amountOnDontCome5: number = 0;
    private _amountOnDontCome6: number = 0;
    private _amountOnDontCome8: number = 0;
    private _amountOnDontCome9: number = 0;
    private _amountOnDontCome10: number = 0;
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    private _bettingUnit: number = 0;
    private _maxBettingUnitsPerShooter: number = 4;
    private _unitsOnHand: number = this._maxBettingUnitsPerShooter;
    private _output: Function = () => {};

    private _currentBankrollRelativeToZero: number = 0;
    private get currentBankrollRelativeToZero() {
        return this._currentBankrollRelativeToZero;
    }

    // Create an internal setter so we don't have to write the min and max and unitsOnHand logic every time the bankroll value changes.
    private set currentBankrollRelativeToZero(value: number) {
        let diff = this._currentBankrollRelativeToZero - value;
        let unitsChange = diff / this._bettingUnit; // It better be evenly divisible
        this._unitsOnHand -= unitsChange;
        this._output({text: `Units on hand: ${this._unitsOnHand}`, color: 'black'});

        // Can't get assert working
        if (this._unitsOnHand < 0) {
            throw new Error('Units on hand went below zero');
        }

        this._currentBankrollRelativeToZero = value;
        if (this._currentBankrollRelativeToZero < this._minBankrollRelativeToZero) {
            this._minBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
        else if (this._currentBankrollRelativeToZero > this._maxBankrollRelativeToZero) {
            this._maxBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
    }

    
    public runSimulation(bettingUnit: number, shooters: number, output: (s: {text:string, color:string}) => void) : number[] {
        output({text: 'Starting simulation for cold table strategy...', color: 'black'});

        let isComeout: boolean = true;
        let maxDontComeBets: number = 2;
        let maxComeBets: number = 2;
        let winsAndLosses: number[] = [];
    
        this._bettingUnit = bettingUnit;
        this._output = output;

        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;

            this._unitsOnHand = this._maxBettingUnitsPerShooter;
            this._output({text: `Units on hand: ${this._unitsOnHand}`, color: 'black'});

            while (sevenOut === false) {
                //output(`Units on hand: ${this._unitsOnHand}`, color: 'black'});

                if (isComeout) {
                    if (this._unitsOnHand > 0 && this._amountOnDontPass < 1) { // If a 12 rolled previously we'd still be on comeout but the 12 is a push so there'd already be money on the don't pass.
                        output({text: `Placing bet on don't pass`, color: 'black'});
                        this._amountOnDontPass = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }
                else {
                    // We want no more than 2 don't come bets set
                    if (this.totalAmountOnDontComeBets() === bettingUnit * maxDontComeBets) {
                        // Don't do anything, just roll
                        output({text: `Max don't come bets in place, just rolling`, color: 'black'});
                    }
                    // See if we should put a unit on the come
                    else if (this.totalAmountOnDontComeBets() == 0
                            && this.totalAmountOnComeBets() < bettingUnit * maxComeBets
                            && this._unitsOnHand > 0) {
                        output({text: 'Placing bet on come', color: 'black'});
                        this._amountOnCome = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                    // See if we should put a unit on the don't come.
                    // We know we're not putting a unit on the come.
                    // We know we're not at max don't come bets as it was checked above.
                    // The idea here is that once you go dark, stay dark
                    else if ((this.totalAmountOnDontComeBets() > 0
                            || this.totalAmountOnComeBets() === bettingUnit * maxComeBets)
                            && this._unitsOnHand > 0) {
                        output({text: `Placing bet on don't come`, color: 'black'});
                        this._amountOnDontCome = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }

                if (isComeout) { output({text: `Coming out...`, color: 'black'}); }
                //output({text: 'Rolling...', color: 'black'});
                let dice = Common.rollDice();
                output({text: `${dice} rolled`, color: 'black'});

                switch (dice) {
                    case 2:
                    case 3:
                        if (isComeout) {
                            if (this._amountOnDontPass > 0) {
                                this.currentBankrollRelativeToZero += bettingUnit * 2;
                                this._amountOnDontPass = 0;
                                output({text: `Won the don't pass`, color: 'black'});
                            }
                        }

                        if (this._amountOnDontCome > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnDontCome = 0;
                            output({text: `Won the don't come`, color: 'black'});
                        }

                        if (this._amountOnCome > 0) { output({text: `Lost come`, color: 'black'}); }

                        this._amountOnCome = 0;
                        break;
                    case 4:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 4
                        if (this._amountOnCome4 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome4 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 4
                        if (this._amountOnDontCome4 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome4 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome4 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome4 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 5:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 5
                        if (this._amountOnCome5 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome5 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 5
                        if (this._amountOnDontCome5 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome5 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome5 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome5 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 6:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 6
                        if (this._amountOnCome6 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome6 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 6
                        if (this._amountOnDontCome6 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome6 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome6 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome6 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 7:
                        // Lose come bets
                        this.loseComeBets(output);

                        // Win don't come bets
                        this.winDontComeBets(output);

                        if (isComeout) {
                            if (this._amountOnDontPass > 0) {
                                output({text: `Lost the don't pass`, color: 'black'});
                            }

                            this._amountOnDontPass = 0;
                        }
                        else {
                            if (this._amountOnDontPass > 0) {
                                this.currentBankrollRelativeToZero += bettingUnit * 2; // Collect original bet and 1:1 winnings
                                this._amountOnDontPass = 0
                                output({text: `Won the don't pass`, color: 'black'});
                            }

                            if (this._amountOnCome > 0) {
                                this.currentBankrollRelativeToZero += bettingUnit * 2;
                                output({text: `Won on come bet`, color: 'black'});
                                this._amountOnCome = 0;
                            }

                            if (this._amountOnDontCome > 0) {
                                output({text: `Lost the don't come`, color: 'black'});
                                this._amountOnDontCome = 0;
                            }
                            
                            output({text: 'Seven out', color: 'black'});
                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            let winLoss = this._unitsOnHand * bettingUnit - this._maxBettingUnitsPerShooter * bettingUnit;
                            output({text: `Win/Loss for this shooter: $${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
                            winsAndLosses.push(this.currentBankrollRelativeToZero);
                        }
                        break;
                    case 8:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 8
                        if (this._amountOnCome8 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome8 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 8
                        if (this._amountOnDontCome8 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome8 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome8 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome8 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 9:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 9
                        if (this._amountOnCome9 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome9 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 9
                        if (this._amountOnDontCome9 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome9 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome9 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome9 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 10:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet (if there is one)
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }

                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Win a come bet on 10
                        if (this._amountOnCome10 > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome10 = 0;
                            output({text: `Won come bet on ${dice}`, color: 'black'});
                        }

                        // Lose a don't come bet on 10
                        if (this._amountOnDontCome10 > 0) { output({text: `Lost don't come on ${dice}`, color: 'black'}); }

                        this._amountOnDontCome10 = 0;

                        if (this._amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome10 = bettingUnit;
                            this._amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});
                        }

                        if (this._amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome10 = bettingUnit;
                            this._amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                        }

                        break;
                    case 11:
                        // Lose the don't pass on the comeout
                        if (isComeout) {
                            this._amountOnDontPass = 0;
                        }

                        // Win the come
                        if (this._amountOnCome > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2; // Take the winnings. We'll add a unit back to the come.
                            output({text: `Won the come`, color: 'black'});
                        }

                        // Lose the don't come
                        if (this._amountOnDontCome > 0) { output({text: `Lost the don't come`, color: 'black'});}
                        this._amountOnDontCome = 0;
                        break;
                    case 12:
                        if (this._amountOnCome > 0) {
                            this._amountOnCome = 0;
                            output({text: `Lost the come`, color: 'black'});
                        }
                        break;
                }
            }
        }

        output({text: '\n', color: 'black'});
        output({text: `Win/Loss after ALL shooters: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${ this.currentBankrollRelativeToZero }`, color: 'red'});
        output({text: `Max bankroll (intra-roll): $${ this._maxBankrollRelativeToZero > 0 ? '+' : '' }${ this._maxBankrollRelativeToZero }`, color: 'red'});
        output({text: `Min bankroll (intra-roll): $${ this._minBankrollRelativeToZero > 0 ? '+' : '' }${ this._minBankrollRelativeToZero }`, color: 'red'});
        return winsAndLosses;
    }

    private loseComeBets(output: (s: {text:string, color:string}) => void): void {
        if (this._amountOnCome4 > 0) {
            this._amountOnCome4 = 0;
            output({text: `Lost come bet on 4`, color: 'black'});
        }
        if (this._amountOnCome5 > 0) {
            this._amountOnCome5 = 0;
            output({text: `Lost come bet on 5`, color: 'black'});
        }
        if (this._amountOnCome6 > 0) {
            this._amountOnCome6 = 0;
            output({text: `Lost come bet on 6`, color: 'black'});
        }
        if (this._amountOnCome8 > 0) {
            this._amountOnCome8 = 0;
            output({text: `Lost come bet on 8`, color: 'black'});
        }
        if (this._amountOnCome9 > 0) {
            this._amountOnCome9 = 0;
            output({text: `Lost come bet on 9`, color: 'black'});
        }
        if (this._amountOnCome10 > 0) {
            this._amountOnCome10 = 0;
            output({text: `Lost come bet on 10`, color: 'black'});
        }
    }
    
    private winDontComeBets(output: (s: {text:string, color:string}) => void) : void {
        // Replace the original bets in the bankroll plus a 1 : 1 winning amount for each
        let total = this._amountOnDontCome4 +
                    this._amountOnDontCome5 +
                    this._amountOnDontCome6 +
                    this._amountOnDontCome8 +
                    this._amountOnDontCome9 +
                    this._amountOnDontCome10;

        // Reset the don't come bets to zero after a win
        if (this._amountOnDontCome4 > 0) {
            this._amountOnDontCome4 = 0;
            output({text: `Won don't come bet on 4`, color: 'black'});
        }
        
        if (this._amountOnDontCome5 > 0) {
            this._amountOnDontCome5 = 0;
            output({text: `Won don't come bet on 5`, color: 'black'});
        }
        
        if (this._amountOnDontCome6 > 0) {
            this._amountOnDontCome6 = 0;
            output({text: `Won don't come bet on 6`, color: 'black'});
        }
        
        if (this._amountOnDontCome8 > 0) {
            this._amountOnDontCome8 = 0;
            output({text: `Won don't come bet on 8`, color: 'black'});
        }
        
        if (this._amountOnDontCome9 > 0) {
            this._amountOnDontCome9 = 0;
            output({text: `Won don't come bet on 9`, color: 'black'});
        }

        if (this._amountOnDontCome10 > 0) {
            this._amountOnDontCome10 = 0;
            output({text: `Won don't come bet on 10`, color: 'black'});
        }
        
        // Do this down here so it will log the wins before it logs the units on hand
        if (total > 0) {
            this.currentBankrollRelativeToZero += total * 2
        }
    }


    private totalAmountOnDontComeBets() : number {
        let total = 0;

        total += this._amountOnDontCome4;
        total += this._amountOnDontCome5;
        total += this._amountOnDontCome6;
        total += this._amountOnDontCome8;
        total += this._amountOnDontCome9;
        total += this._amountOnDontCome10;

        return total;
    }

    private totalAmountOnComeBets() : number {
        let total = 0;

        total += this._amountOnCome4;
        total += this._amountOnCome5;
        total += this._amountOnCome6;
        total += this._amountOnCome8;
        total += this._amountOnCome9;
        total += this._amountOnCome10;

        return total;
    }
}