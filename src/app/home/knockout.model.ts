import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Common } from "./common.model";
import { max } from "rxjs";
import { Output } from "@angular/core";

export class Knockout {
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

    public runSimulation(bettingUnit: number, shooters: number, oddsMultiple: number, output: (s: {text:string, color:string}) => void) : number[] {
        output({text: 'Starting simulation for Knockout strategy...', color: 'black'});

        let isComeout: boolean = true;
        let amountOnPass: number = 0;
        let amountOnPassLineOdds: number = 0;
        let amountOnDontPass: number = 0;
        this._output = output;
        let oddsBet: number = bettingUnit * oddsMultiple;
        let oddsBet5And9: number = amountOnPassLineOdds % 2 === 0 ? oddsBet : oddsBet + 1; // When the point is 5 or 9 the odds bet must be even as it pays 3:2
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

                    if (amountOnDontPass < 1) {
                        amountOnDontPass = bettingUnit;
                        output({text: `Putting $${bettingUnit} on the don't pass`, color: 'black'});
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }
                else {
                    if (amountOnPassLineOdds < 1) {
                        amountOnPassLineOdds = point === 5 || point === 9 ? oddsBet5And9 : oddsBet;
                        output({text: `Putting $${amountOnPassLineOdds} on pass line odds`, color: 'black'});
                        this.currentBankrollRelativeToZero -= amountOnPassLineOdds;
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

                            if (dice !== 12) { // 12 is a push on the don't pass
                                output({text: `Won don't pass, collecting $${bettingUnit}`, color: 'black'});
                                this.currentBankrollRelativeToZero += bettingUnit;
                            }
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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
                        }
                        break;
                    case 7:
                        if (isComeout) {
                            // There should always be money on the pass line
                            output({text: `Pass line come out winner...Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Don't pass loser`, color: 'black'});
                            amountOnDontPass = 0;
                        }
                        else {
                            output({text: 'Seven out', color: 'black'});
                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            amountOnPass = 0;
                            amountOnPassLineOdds = 0;
                            
                            output({text: `Don't pass winner, collecting original bet of $${bettingUnit}`, color: 'black'});
                            output({text: `Collecting winnings of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            amountOnDontPass = 0;

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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
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

                            output({text: `Lost don't pass`, color: 'black'});
                            amountOnDontPass = 0;
                        }
                        break;
                    case 11:
                        if (isComeout) {
                            output({text: `Yo eleven! Pass line winner, collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black' });
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Lost don't pass`, color: 'black'});
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
}