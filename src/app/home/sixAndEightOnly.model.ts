import { Common } from "./common.model";

export class SixAndEightOnly {
    private _amountOn6: number = 0;
    private _amountOn8: number = 0;
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    //private _output: Function = () => {};
    private _numHits: number = 0;

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
        output({text: 'Starting simulation for the place 6 and 8 only strategy...', color: 'black'});

        let isComeout: boolean = true;
        let winsAndLosses: number[] = [];
        //this._output = output;

        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;

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
                    case 5:
                    case 9:
                    case 10:
                        // No bets on the 4, 5, 9, 10 so just log it out and record whether we established or hit the point
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
                    case 6:
                    case 8:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Place bets are off on the comeout`, color: 'black'});
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else {
                            if (point === dice) {
                                // We hit the point but we don't really care
                                output({text: `Point of ${dice} hit`, color: 'black'});
                                point = 0;
                                isComeout = true;
                            }
                        
                            // There will always be money on the 6 / 8
                            let payout: number = (this._amountOn6 / 6) * 7;
                             
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
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
                            this._amountOn6 = 0;
                            this._amountOn8 = 0;

                            output({text: `Win/Loss for this shooter: $${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
                            winsAndLosses.push(this.currentBankrollRelativeToZero);
                        }
                        break;
               }
            }
        }

        output({text: `Win/Loss after ALL shooters: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${ this.currentBankrollRelativeToZero }`, color: 'red'});
        output({text: `Max bankroll: $${ this._maxBankrollRelativeToZero > 0 ? '+' : '' }${ this._maxBankrollRelativeToZero }`, color: 'red'});
        output({text: `Min bankroll: $${ this._minBankrollRelativeToZero > 0 ? '+' : '' }${ this._minBankrollRelativeToZero }`, color: 'red'});
        return winsAndLosses;
    }

}