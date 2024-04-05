import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Common } from "./common.model";
import { max } from "rxjs";
import { Output } from "@angular/core";

export class PassLineWithSixAndEight {
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

    public runSimulation(bettingUnit: number, shooters: number, oddsMultiple: number, output: (s: {text:string, color:string}) => void, incrementProgress: () => void, diceRolls : number[]) : number[] {
        output({text: 'Starting simulation for pass line with 6 and 8 strategy...', color: 'black'});

        let isComeout: boolean = true;
        let amountOnPass: number = 0;
        let amountOnPassLineOdds: number = 0;
        this._output = output;
        let oddsBet: number = bettingUnit * oddsMultiple;
        let oddsBet5And9: number = amountOnPassLineOdds % 2 === 0 ? oddsBet : oddsBet + 1; // When the point is 5 or 9 the odds bet must be even as it pays 3:2
        let dice: number = 0;
        let winsAndLosses: number[] = [];
        let amountOn6: number = 0;
        let amountOn8: number = 0;
        let amountOn5: number = 0;
        let amountOn9: number = 0;
        let rollDice: boolean = diceRolls.length < 1;

        let rollCount: number = -1;

        for (let i: number = 0; i < shooters; i++)
        {
            incrementProgress();
            
            // Allows the page to refresh with the status bar and output
            //await Common.sleep(1);

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

                    let sixAndEightBet: number = 0; // Payout is 7:6 so we need to put an amount on the 6 and 8 that is divisible by 6
                    let rem: number = bettingUnit % 6;

                    if (rem === 0) {
                        // This is unlikely as the betting unit is not likely to be a multiple of 6 but just in case...
                        sixAndEightBet = bettingUnit;
                    }
                    else {
                        // Find the next multiple of 6 and put that on both the 6 and 8 unless one of those is the point
                        let mult: number = Math.floor(bettingUnit / 6);
                        sixAndEightBet = (mult + 1) * 6
                    }

                    if (amountOn6 < 1) {
                        if (point === 6) {
                            if (amountOn5 < 1) {
                                output({text: `The point is 6 so placing the 5 for $${bettingUnit}`, color: 'black'});
                                amountOn5 = bettingUnit;
                                this.currentBankrollRelativeToZero -= amountOn5;
                            }
                        }
                        else {
                            if (amountOn5 > 0) {
                                output({text: `6 is no longer the point so collecting $${amountOn5} from the 5`, color: 'black'});
                                this.currentBankrollRelativeToZero += amountOn5;
                                amountOn5 = 0;
                            }

                            output({text: `Placing the 6 for $${sixAndEightBet}`, color: 'black'});
                            amountOn6 = sixAndEightBet;
                            this.currentBankrollRelativeToZero -= amountOn6;
                        }
                    }
                    else if (point === 6) {
                        // There is money on the 6 but the point is now 6 so we need to move that money to the 5
                        output({text: `There is money on the 6 but the point is now 6 so we need to move that money to the 5`, color: 'black'});

                        // The dollar amount will be different between the 5 and 6 so figure out how much we need to move and how much we need to collect
                        let mod = amountOn6 % bettingUnit;

                        output({text: `Collecting $${mod}`, color: 'black'});
                        this.currentBankrollRelativeToZero += mod;

                        amountOn5 = bettingUnit;
                        amountOn6 = 0;
                    }

                    if (amountOn8 < 1) {
                        if (point === 8) {
                            if (amountOn9 < 1) {
                                output({text: `The point is 8 so placing the 9 for $${bettingUnit}`, color: 'black'});
                                amountOn9 = bettingUnit;
                                this.currentBankrollRelativeToZero -= amountOn9;
                            }
                        }
                        else {
                            if (amountOn9 > 0) {
                                output({text: `8 is no longer the point so collecting $${amountOn9} from the 9`, color: 'black'});
                                this.currentBankrollRelativeToZero += amountOn9;
                                amountOn9 = 0;
                            }
                            
                            output({text: `Placing the 8 for $${sixAndEightBet}`, color: 'black'});
                            amountOn8 = sixAndEightBet;
                            this.currentBankrollRelativeToZero -= amountOn8;
                        }
                    }
                    else if (point === 8) {
                        // There is money on the 8 but the point is now 8 so we need to move that money to the 5
                        output({text: `There is money on the 8 but the point is now 8 so we need to move that money to the 9`, color: 'black'});

                        // The dollar amount will be different between the 8 and 9 so figure out how much we need to move and how much we need to collect
                        let mod = amountOn8 % bettingUnit;

                        output({text: `Collecting $${mod}`, color: 'black'});
                        this.currentBankrollRelativeToZero += mod;

                        amountOn9 = bettingUnit;
                        amountOn8 = 0;
                    }
                }

                // Roll the dice
                if (isComeout) { output({text: `Coming out...`, color: 'black'}); }
                //output({text: 'Rolling...', color: 'black'});
                let dice: number;
                rollCount++;

                if (rollDice) {
                    dice = Common.rollDice();
                    diceRolls.push(dice);
                }
                else {
                    dice = diceRolls[rollCount];
                }

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
                        break;
                    case 5:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else {
                            if (point === dice) {
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

                            // Pay the 5 place bet at 7:5
                            if (amountOn5 > 0) {
                                output({text: `Won the 5 place bet, collecting $${(amountOn5 / 5) * 7}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOn5 / 5) * 7;
                            }
                        }
                        break;
                    case 6:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else {
                            if (point === dice) {
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

                                output({text: `Collecting odds win of $${(amountOnPassLineOdds / 5) * 6}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOnPassLineOdds / 5) * 6;
                                amountOnPassLineOdds = 0;
                            }

                            // Pay the 6 place bet at 7:6
                            if (amountOn6 > 0) {
                                output({text: `Won the 6 place bet, collecting $${(amountOn6 / 6) * 7}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOn6 / 6) * 7;
                            }
                        }
                        break;
                    case 7:
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
                            amountOn5 = 0;
                            amountOn6 = 0;
                            amountOn8 = 0;
                            amountOn9 = 0;
                            
                            let winLoss = this.currentBankrollRelativeToZero - this._bankrollPreviousShooter;

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
                        else {
                            if (point === dice) {
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

                                output({text: `Collecting odds win of $${(amountOnPassLineOdds / 5) * 6}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOnPassLineOdds / 5) * 6;
                                amountOnPassLineOdds = 0;
                            }

                            // Pay the 8 place bet at 7:6
                            if (amountOn8 > 0) {
                                output({text: `Won the 8 place bet, collecting $${(amountOn8 / 6) * 7}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOn8 / 6) * 7;
                            }

                        }
                        break;

                    case 9:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else {
                            if (point === dice) {
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

                            // Pay the 9 place bet at 7:5
                            if (amountOn9 > 0) {
                                output({text: `Won the 9 place bet, collecting $${(amountOn9 / 5) * 7}`, color: 'black'});
                                this.currentBankrollRelativeToZero += (amountOn9 / 5) * 7;
                            }
                            
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
                        break;
                    case 11:
                        if (isComeout) {
                            output({text: `Yo eleven! Pass line winner, collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black' });
                            this.currentBankrollRelativeToZero += bettingUnit;
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
}