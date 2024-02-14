import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Common } from "./common.model";
import { max } from "rxjs";
import { Output } from "@angular/core";

export class PassLineOnly {
    private _amountOnCome4: number = 0;
    private _amountOnCome5: number = 0;
    private _amountOnCome6: number = 0;
    private _amountOnCome8: number = 0;
    private _amountOnCome9: number = 0;
    private _amountOnCome10: number = 0;
    private _amountOnCome4Odds: number = 0;
    private _amountOnCome5Odds: number = 0;
    private _amountOnCome6Odds: number = 0;
    private _amountOnCome8Odds: number = 0;
    private _amountOnCome9Odds: number = 0;
    private _amountOnCome10Odds: number = 0;
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    private _bettingUnit: number = 0;
    private _output: Function = () => {};
    private _bankrollPreviousShooter: number = 0;
    private _currentBankrollRelativeToZero: number = 0;
    private get currentBankrollRelativeToZero() {
        return this._currentBankrollRelativeToZero;
    }

    // Create an internal setter so we don't have to write the min and max logic every time the bankroll value changes.
    private set currentBankrollRelativeToZero(value: number) {
        this._currentBankrollRelativeToZero = value;
        this._output({text: `Current bankroll $${this.currentBankrollRelativeToZero}`, color: 'black'});

        if (this._currentBankrollRelativeToZero < this._minBankrollRelativeToZero) {
            this._minBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
        else if (this._currentBankrollRelativeToZero > this._maxBankrollRelativeToZero) {
            this._maxBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
    }

    public runSimulation(bettingUnit: number, shooters: number, oddsMultiple: number, maxComeBets: number, output: (s: {text:string, color:string}) => void) : number[] {
        output({text: 'Starting simulation for pass line strategy...', color: 'black'});

        let isComeout: boolean = true;
        let amountOnPass: number = 0;
        let amountOnPassLineOdds: number = 0;
        this._output = output;
        let oddsBet: number = bettingUnit * oddsMultiple;
        let oddsBet5And9: number = amountOnPassLineOdds % 2 === 0 ? oddsBet : oddsBet + 1; // When the point is 5 or 9 the odds bet must be even as it pays 3:2
        let amountOnCome: number = 0;
        let dice: number = 0;
        let winsAndLosses: number[] = [];

        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;

            while (sevenOut === false) {

                // Set the bets
                if (isComeout) {
                    if (amountOnPass < 1) {
                        amountOnPass = bettingUnit;
                        output({text: `Putting $${bettingUnit} on the pass line`, color: 'black'});
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }
                else {
                    if (amountOnPassLineOdds < 1) {
                        amountOnPassLineOdds = point === 5 || point === 9 ? oddsBet5And9 : oddsBet;
                        output({text: `Putting $${amountOnPassLineOdds} on pass line odds`, color: 'black'});
                        this.currentBankrollRelativeToZero -= amountOnPassLineOdds;
                    }

                    // See if we need to place a come bet
                    if (this.totalAmountOnComeBets() < maxComeBets * bettingUnit) {
                        amountOnCome = bettingUnit;
                        output({text: `Putting $${bettingUnit} on come`, color: 'black'});
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }

                // Roll the dice
                if (isComeout) { output({text: `Coming out...`, color: 'black'}); }
                //output({text: 'Rolling...', color: 'black'});
                dice = Common.rollDice();
                output({text: `${dice} rolled`, color: 'black'});

                switch (dice) {
                    case 2:
                    case 3:
                    case 12:
                        if (isComeout) {
                            // Rather than removing pass line, decrementing the bankroll and adding it back to the pass line just decrement bankroll and be done
                            output({text: `Craps...Lost passline, adding $${bettingUnit} back to pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit;
                        }
                        else if (amountOnCome > 0) {
                            amountOnCome = 0;
                            output({text: `Lost the come`, color: 'black'});
                        }
                        break;
                    case 4:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 2:1 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${2 * amountOnPassLineOdds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += 2 * amountOnPassLineOdds;
                            amountOnPassLineOdds = 0;
                        }
                        
                        // Win a come bet on 4
                        if (this._amountOnCome4 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome4 = 0;

                            // Collect odds plus winnings. Pays 2:1
                            output({text: `Collecting original odds bet of $${this._amountOnCome4Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome4Odds;

                            output({text: `Collecting odds win of: $${this._amountOnCome4Odds * 2}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome4Odds * 2;
                            this._amountOnCome4Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome4 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome4Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;
                    case 5:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 3:2 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${amountOnPassLineOdds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${(3 * amountOnPassLineOdds) / 2}`, color: 'black'});
                            this.currentBankrollRelativeToZero += (3 * amountOnPassLineOdds) / 2;
                            amountOnPassLineOdds = 0;
                        }

                        // Win a come bet on 5
                        if (this._amountOnCome5 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome5 = 0;

                            // Collect odds plus winnings. Pays 3:2
                            output({text: `Collecting original odds bet of $${this._amountOnCome5Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome5Odds;

                            output({text: `Collecting odds win of: $${(this._amountOnCome5Odds / 2) * 3}`, color: 'black'});
                            this.currentBankrollRelativeToZero += (this._amountOnCome5Odds / 2) * 3;
                            this._amountOnCome5Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome5 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome5Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;
                    case 6:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point but we don't really care
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 6:5 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${Math.floor(amountOnPassLineOdds / 5) * 6}`, color: 'black'});
                            this.currentBankrollRelativeToZero += Math.floor(amountOnPassLineOdds / 5) * 6;
                            amountOnPassLineOdds = 0;
                        }

                        // Win a come bet on 6
                        if (this._amountOnCome6 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome6 = 0;

                            // Collect odds plus winnings. Pays 6:5
                            output({text: `Collecting original odds bet of $${this._amountOnCome6Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome6Odds;

                            output({text: `Collecting odds win of: $${Math.floor(this._amountOnCome6Odds / 5) * 6}`, color: 'black'});
                            this.currentBankrollRelativeToZero += Math.floor(this._amountOnCome6Odds / 5) * 6;
                            this._amountOnCome6Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome6 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome6Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;
                    case 7:
                        this.loseComeBets(output);

                        if (isComeout) {
                            // There should always be money on the pass line
                            output({text: `Pass line come out winner...Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;
                        }
                        else {
                            output({text: 'Seven out', color: 'black'});
                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            amountOnPass = 0;
                            amountOnPassLineOdds = 0;
                            
                            if (amountOnCome > 0) {
                                output({text: `Come bar winner...Collecting $${bettingUnit * 2}`, color: 'black'});
                                this.currentBankrollRelativeToZero += bettingUnit * 2;
                                amountOnCome = 0;
                            }

                            let winLoss = this.currentBankrollRelativeToZero - this._bankrollPreviousShooter;

                            output({text: `Win/Loss for this shooter: ${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: ${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
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
                            // We hit the point but we don't really care
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 6:5 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${Math.floor(amountOnPassLineOdds / 5) * 6}`, color: 'black'});
                            this.currentBankrollRelativeToZero += Math.floor(amountOnPassLineOdds / 5) * 6;
                            amountOnPassLineOdds = 0;
                        }

                        // Win a come bet on 8
                        if (this._amountOnCome8 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome8 = 0;

                            // Collect odds plus winnings. Pays 6:5
                            output({text: `Collecting original odds bet of $${this._amountOnCome8Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome8Odds;

                            output({text: `Collecting odds win of: $${Math.floor(this._amountOnCome8Odds / 5) * 6}`, color: 'black'});
                            this.currentBankrollRelativeToZero += Math.floor(this._amountOnCome8Odds / 5) * 6;
                            this._amountOnCome8Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome8 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome8Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;

                    case 9:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 3:2 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${amountOnPassLineOdds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${(3 * amountOnPassLineOdds) / 2}`, color: 'black'});
                            this.currentBankrollRelativeToZero += (3 * amountOnPassLineOdds) / 2;
                            amountOnPassLineOdds = 0;
                        }

                        // Win a come bet on 9
                        if (this._amountOnCome9 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome9 = 0;

                            // Collect odds plus winnings. Pays 3:2
                            output({text: `Collecting original odds bet of $${this._amountOnCome9Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome9Odds;

                            output({text: `Collecting odds win of: $${(this._amountOnCome9Odds / 2) * 3}`, color: 'black'});
                            this.currentBankrollRelativeToZero += (this._amountOnCome9Odds / 2) * 3;
                            this._amountOnCome9Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome9 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome9Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;
                    case 10:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            point = 0;
                            isComeout = true;

                            // Collect 1:1 for pass line, leaving pass line bet in place
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;

                            // Collect original odds bet, collect 2:1 for odds payout, and zero out the odds amount
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += amountOnPassLineOdds;

                            output({text: `Collecting odds win of $${2 * amountOnPassLineOdds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += 2 * amountOnPassLineOdds;
                            amountOnPassLineOdds = 0;
                        }

                        // Win a come bet on 10
                        if (this._amountOnCome10 > 0) {
                            // Collect the original bet and winnings
                            output({text: `Won come bet on ${dice}, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            this._amountOnCome10 = 0;

                            // Collect odds plus winnings. Pays 2:1
                            output({text: `Collecting original odds bet of $${this._amountOnCome10Odds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome10Odds;

                            output({text: `Collecting odds win of: $${this._amountOnCome10Odds * 2}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnCome10Odds * 2;
                            this._amountOnCome10Odds = 0;
                        }
                        
                        if (amountOnCome > 0) {
                            // Move the come bet to the number
                            this._amountOnCome10 = bettingUnit;
                            amountOnCome = 0;
                            output({text: `Moving come bet to ${dice}`, color: 'black'});

                            // Add odds
                            this._amountOnCome10Odds = oddsBet;
                            output({text: `Adding odds of $${oddsBet} to come ${dice}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= oddsBet;
                        }

                        break;
                    case 11:
                        if (isComeout) {
                            output({text: `Yo eleven! Pass line winner, collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black' });
                            this.currentBankrollRelativeToZero += bettingUnit;
                        }
                        else if (amountOnCome > 0) {
                            output({text: `Yo eleven! Won the come, collecting $${bettingUnit * 2}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2; // Take the winnings. We'll add a unit back to the come.
                        }

                        break;
                }
            }
        }

        output({text: `Win/Loss after ALL shooters: ${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${ this.currentBankrollRelativeToZero }`, color: 'red'});
        output({text: `Max bankroll: ${ this._maxBankrollRelativeToZero > 0 ? '+' : '' }${ this._maxBankrollRelativeToZero }`, color: 'red'});
        output({text: `Min bankroll: ${ this._minBankrollRelativeToZero > 0 ? '+' : '' }${ this._minBankrollRelativeToZero }`, color: 'red'});
        return winsAndLosses;
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
    private loseComeBets(output: (s: {text:string, color:string}) => void): void {
        if (this._amountOnCome4 > 0) {
            this._amountOnCome4 = 0;
            this._amountOnCome4Odds = 0;
            output({text: `Lost come bet on 4`, color: 'black'});
        }
        if (this._amountOnCome5 > 0) {
            this._amountOnCome5 = 0;
            this._amountOnCome5Odds = 0;
            output({text: `Lost come bet on 5`, color: 'black'});
        }
        if (this._amountOnCome6 > 0) {
            this._amountOnCome6 = 0;
            this._amountOnCome6Odds = 0;
            output({text: `Lost come bet on 6`, color: 'black'});
        }
        if (this._amountOnCome8 > 0) {
            this._amountOnCome8 = 0;
            this._amountOnCome8Odds = 0;
            output({text: `Lost come bet on 8`, color: 'black'});
        }
        if (this._amountOnCome9 > 0) {
            this._amountOnCome9 = 0;
            this._amountOnCome9Odds = 0;
            output({text: `Lost come bet on 9`, color: 'black'});
        }
        if (this._amountOnCome10 > 0) {
            this._amountOnCome10 = 0;
            this._amountOnCome10Odds = 0;
            output({text: `Lost come bet on 10`, color: 'black'});
        }
    }

}