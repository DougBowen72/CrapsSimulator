import { Common } from "./common.model";

export class SixAndEight {
    private _amountOn6: number = 0;
    private _amountOn8: number = 0;
    private _amountOn5: number = 0;
    private _amountOn9: number = 0;
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    //private _output: Function = () => {};
    private _numHits: number = 0;

    private get numHits() {
        return this._numHits;
    }
    private set numHits(value: number) {
        this._numHits = value;

        // Collect the first two hits and then every even number of hits until we hit the 6th hit then collect everything
        switch (this._numHits) {
            case 3:
            case 5:
                this._shouldCollect = false;
                //this._output({text: `numHits = ${this._numHits}, _shouldCollect set to false`, color: 'green'});
                break;
            default:
                this._shouldCollect = true;
                //this._output({text: `numHits = ${this._numHits}, _shouldCollect set to true`, color: 'green'});
        }
    }

    private _shouldCollect: boolean = true;
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

    public runSimulation(bettingUnit: number, shooters: number, output: (s: {text:string, color:string}) => void) : number[] {
        output({text: 'Starting simulation for 6 and 8 strategy...', color: 'black'});

        let isComeout: boolean = true;
        let winsAndLosses: number[] = [];
        //this._output = output;

        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;
            this.numHits = 0;

            while (sevenOut === false) {

                // Set the bets
                if (isComeout) {
                    // No line bets
                }
                else {
                    if (this._amountOn6 < 1) {
                        // 8 should also be 0 since the two should always match
                        // Payout is 7:6 so we need to put an amount on the 6 that is divisible by 6
                        let rem: number = bettingUnit % 6;

                        if (rem == 0)
                        {
                            // This is unlikely as the betting unit is not likely to be a multiple of 6 but just in case...
                            this._amountOn6 = bettingUnit;
                            output({text: `Placing the 6 for $${bettingUnit}`, color: 'black'});
                            this._amountOn8 = bettingUnit;
                            output({text: `Placing the 8 for $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit * 2;
                        }
                        else {
                            // Find the next multiple of 6 and put that on both the 6 and 8
                            let mult: number = Math.floor(bettingUnit / 6);
                            this._amountOn6 = this._amountOn8 = (mult + 1) * 6;
                            output({text: `Placing the 6 for $${this._amountOn6}`, color: 'black'});
                            this._amountOn8 = this._amountOn6;
                            output({text: `Placing the 8 for $${this._amountOn8}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= (this._amountOn6 + this._amountOn8);
                        }
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
                    case 11:
                    case 12:
                        break; // This strategy is only place bets so we'll never care about 2, 3, 11, 12
                    case 4:
                        // No bets on the 4 so just log it out and record whether we established or hit the point
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
                                // We hit the point but we don't really care
                                output({text: `Point of ${dice} hit`, color: 'black'});
                                point = 0;
                                isComeout = true;
                            }

                            if (this._amountOn5 > 0) {
                                // Pay the bet 7:5 and leave the bet in place and see if we need to collect or add the 9.
                                let payout: number = (this._amountOn5 / 5) * 7;

                                this.numHits++;

                                if (this._shouldCollect) {
                                    output({text: `Won the 5 for $${payout}, collecting`, color: 'black'});
                                    this.currentBankrollRelativeToZero += payout;
                                }
                                else {
                                    if (this._amountOn9 < 1) {
                                        output({text: `Won the 5 for $${payout}, $${bettingUnit} going on the 9`, color: 'black'});
                                        this._amountOn9 = bettingUnit;
                                        this.currentBankrollRelativeToZero += payout - bettingUnit; // Collect the extra dollars
                                    }
                                }
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
                            }
                        
                            // There will always be money on the 6
                            let payout: number = (this._amountOn6 / 6) * 7;
                            this.numHits++;
                             
                            if (this._shouldCollect) {
                                output({text: `Won the 6 for $${payout}, collecting`, color: 'black'});
                                this.currentBankrollRelativeToZero += payout;
                            }
                            else {
                                // We're not going to collect so there shouldn't be money on either the 5 or 9. Go to the 5 first
                                if (this._amountOn5 < 1) {
                                    output({text: `Won the 6 for $${payout}, $${bettingUnit} going on the 5`, color: 'black'});
                                    this._amountOn5 = bettingUnit;
                                    this.currentBankrollRelativeToZero += payout - bettingUnit;
                                }
                                else if (this._amountOn9 < 1) {
                                    output({text: `Won the 6 for $${payout}, $${bettingUnit} going on the 9`, color: 'black'});
                                    this._amountOn5 = bettingUnit;
                                    this.currentBankrollRelativeToZero += payout - bettingUnit;
                                }
                                else {
                                    output({text: `Something is wrong. We're not supposed to collect but both the 5 and 9 are already covered.`, color: 'red'});
                                }
                            }
                        }

                        break;
                    case 7:
                        if (isComeout) {
                            // We don't care about the 7 on the comeout
                        }
                        else {
                            output({text: 'Seven out', color: 'black'});
                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            let winLoss = this.currentBankrollRelativeToZero - this._bankrollPreviousShooter;
                            this._amountOn5 = 0;
                            this._amountOn6 = 0;
                            this._amountOn8 = 0;
                            this._amountOn9 = 0;

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
                            }
                        
                            // There will always be money on the 8
                            let payout: number = (this._amountOn6 / 6) * 7;
                            this.numHits++;
                             
                            if (this._shouldCollect) {
                                output({text: `Won the 8 for $${payout}, collecting`, color: 'black'});
                                this.currentBankrollRelativeToZero += payout;
                            }
                            else {
                                // We're not going to collect so there shouldn't be money on either the 5 or 9. Go to the 5 first
                                if (this._amountOn5 < 1) {
                                    output({text: `Won the 8 for $${payout}, $${bettingUnit} going on the 5`, color: 'black'});
                                    this._amountOn5 = bettingUnit;
                                    this.currentBankrollRelativeToZero += payout - bettingUnit;
                                }
                                else if (this._amountOn9 < 1) {
                                    output({text: `Won the 8 for $${payout}, $${bettingUnit} going on the 9`, color: 'black'});
                                    this._amountOn5 = bettingUnit;
                                    this.currentBankrollRelativeToZero += payout - bettingUnit;
                                }
                                else {
                                    output({text: `Something is wrong. We're not supposed to collect but both the 5 and 9 are already covered.`, color: 'red'});
                                }
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
                                // We hit the point but we don't really care
                                output({text: `Point of ${dice} hit`, color: 'black'});
                                point = 0;
                                isComeout = true;
                            }

                            if (this._amountOn9 > 0) {
                                // Pay the bet 7:5 and leave the bet in place.
                                let payout: number = (this._amountOn9 / 5) * 7;

                                this.numHits++;

                                // Initially we should always collect on the 9 since that's the last bet we place but I'll leave this logic in place in case
                                // I want to play around with the pressing logic.
                                if (this._shouldCollect) {
                                    output({text: `Won the 5 for $${payout}, collecting`, color: 'black'});
                                    this.currentBankrollRelativeToZero += payout;
                                }
                                else {
                                    output({text: `Won the 5 for $${payout}, pressing the 9`, color: 'red'});
                                    this._amountOn9 += bettingUnit;
                                    this.currentBankrollRelativeToZero += payout - bettingUnit; // Collect the extra dollars
                                }
                            }
                        }

                        break;
                    case 10:
                        // No bets on the 10 so just log it out and record whether we established or hit the point
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