import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Common } from "./common.model";

export class PassLineOnly {
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
        if (this._currentBankrollRelativeToZero < this._minBankrollRelativeToZero) {
            this._minBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
        else if (this._currentBankrollRelativeToZero > this._maxBankrollRelativeToZero) {
            this._maxBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
    }

    public runSimulation(bettingUnit: number, shooters: number, oddsMultiple: number, output: (s: {text:string, color:string}) => void) {
        output({text: 'Starting simulation for pass line only strategy...', color: 'black'});

        let isComeout: boolean = true;
        let amountOnPass: number = 0;
        let amountOnOdds: number = 0;
        this._output = output;

        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;

            while (sevenOut === false) {

                // Set the bets
                if (isComeout) {
                    // No line bets
                    if (amountOnPass < 1) {
                        amountOnPass = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
                        output({text: `Putting $${bettingUnit} on the pass line`, color: 'black'});
                    }
                }
                else {
                    if (amountOnOdds < 1) {
                        amountOnOdds = bettingUnit * oddsMultiple;
                        this.currentBankrollRelativeToZero -= amountOnOdds;

                        if (point === 5 || point === 9) {
                            // When the point is 5 or 9 the odds bet must be even as it pays 3:2
                            if (amountOnOdds % 2 !== 0) {
                                amountOnOdds++; // Add one to make it even
                                this.currentBankrollRelativeToZero--;
                            }
                        }
                        output({text: `Taking $${amountOnOdds} odds`, color: 'black'});
                    }
                }

                // Roll the dice
                if (isComeout) { output({text: `Coming out...`, color: 'black'}); }
                //output({text: 'Rolling...', color: 'black'});
                let dice = Common.rollDice();
                output({text: `${dice} rolled`, color: 'black'});

                switch (dice) {
                    case 2:
                    case 3:
                    case 12:
                        if (isComeout) {
                            // Rather than removing pass line, decrementing the bankroll and adding it back to the pass line just decrement bankroll and be done
                            this.currentBankrollRelativeToZero -= bettingUnit;
                            output({text: `Craps...Lost passline, adding $${bettingUnit} back to pass line`, color: 'black'});
                        }
                        break;
                    case 4:
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
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});

                            // Collect original odds bet, collect 2:1 for odds payout, and zero out the odds amount
                            this.currentBankrollRelativeToZero += amountOnOdds;
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += 2 * amountOnOdds;
                            output({text: `Collecting odds win of $${2 * amountOnOdds}`, color: 'black'});
                            amountOnOdds = 0;
                        }

                        break;
                    case 5:
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
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});

                            // Collect original odds bet, collect 3:2 for odds payout, and zero out the odds amount
                            this.currentBankrollRelativeToZero += amountOnOdds;
                            output({text: `Collecting original odds bet of $${amountOnOdds}`, color: 'black'});
                            this.currentBankrollRelativeToZero += (3 * amountOnOdds) / 2;
                            output({text: `Collecting odds win of $${(3 * amountOnOdds) / 2}`, color: 'black'});
                            amountOnOdds = 0;
                        }

                        break;
                    case 6:
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
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});

                            // Collect original odds bet, collect 6:5 for odds payout, and zero out the odds amount
                            this.currentBankrollRelativeToZero += amountOnOdds;
                            output({text: `Collecting original odds bet of $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero += Math.floor(amountOnOdds / 5) * 6;
                            output({text: `Collecting odds win of $${Math.floor(amountOnOdds / 5) * 6}`, color: 'black'});
                            amountOnOdds = 0;
                        }

                        break;
                    case 7:
                        if (isComeout) {
                            // There should always be money on the pass line
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Pass line come out winner...Collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black'});
                        }
                        else {
                            output({text: 'Seven out', color: 'black'});
                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            amountOnPass = 0;
                            amountOnOdds = 0;
                            let winLoss = this.currentBankrollRelativeToZero - this._bankrollPreviousShooter;

                            output({text: `Win/Loss for this shooter: ${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: ${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
                        }
                        break;
                    case 11:
                        if (isComeout) {
                            this.currentBankrollRelativeToZero += bettingUnit;
                            output({text: `Yo eleven! Pass line winner, collecting $${bettingUnit} from the pass line win, leaving original bet on pass line`, color: 'black' });
                        }
                        break;
                }
            }
        }

        output({text: `Win/Loss after ALL shooters: ${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${ this.currentBankrollRelativeToZero }`, color: 'red'});
        output({text: `Max bankroll: ${ this._maxBankrollRelativeToZero > 0 ? '+' : '' }${ this._maxBankrollRelativeToZero }`, color: 'red'});
        output({text: `Min bankroll: ${ this._minBankrollRelativeToZero > 0 ? '+' : '' }${ this._minBankrollRelativeToZero }`, color: 'red'});
    }

}