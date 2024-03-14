import { Common } from "./common.model";

export class Feed6And8 {
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    //private _output: Function = () => {};
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
        output({text: 'Starting simulation for Feed the 6 and 8 strategy...', color: 'black'});

        let isComeout: boolean = true;
        let winsAndLosses: number[] = [];
        let amountOn5: number = 0;
        let amountOn6: number = 0;
        let amountOn8: number = 0;
        let amountOn9: number = 0;

        // There will always be money on the 5 and 9 so figure this out once
        let fiveAndNinePayout: number = (bettingUnit / 5) * 7;

        // Figure out how much we need to add to the 6 or 8 in addition to the 5/9 payout to make it a multiple of 6
        // Payout is 7:6 so we need to put an amount on the 6/8 that is divisible by 6
        let rem: number = fiveAndNinePayout % 6;

        let addition: number;

        if (rem == 0)
        {
            addition = fiveAndNinePayout;
        }
        else {
            // Find the previous multiple of 6
            let mult: number = Math.floor(fiveAndNinePayout / 6);
            addition = mult * 6;
        }

        // Now figure out how much we will collect since the 5 and 9 payout will be more than what we put on the 6/8
        let addBackToBankroll: number = fiveAndNinePayout - addition;
        
        // Now spin the shooters
        for (let i: number = 0; i < shooters; i++)
        {
            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;

            while (sevenOut === false) {
                // Set the bets
                if (isComeout) {
                    // No line bets
                    // The 5 and 9 will be off on the comeout but we'll place them here because it's simplest this way.
                    if (amountOn5 === 0) {
                        output({text: `Placing the 5 for $${bettingUnit}`, color: 'black'});
                        amountOn5 = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
                        output({text: `Placing the 9 for $${bettingUnit}`, color: 'black'});
                        amountOn9 = bettingUnit;
                        this.currentBankrollRelativeToZero -= bettingUnit;
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
                    case 5:
                    case 9:
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

                            output({text: `Won the ${dice} for $${fiveAndNinePayout}, adding $${addition} to the ${dice === 5 ? '6' : '8'} for a total of $${(dice === 5 ? amountOn6 : amountOn8) + addition}, along with $${addBackToBankroll} going back to the bankroll`, color: 'black'});
                            
                            if (dice === 5) {
                                amountOn6 += addition
                            }
                            else {
                                amountOn8 += addition
                            }
                            
                            this.currentBankrollRelativeToZero += addBackToBankroll;
                        }

                        break;
                    case 6:
                    case 8:
                            if (isComeout) {
                            point = dice;
                            isComeout = false;
                            if (amountOn6 > 0 || amountOn8 > 0) {
                                output({text: `Place bets are off on the comeout`, color: 'black'});
                            }
                            
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else {
                            if (point === dice) {
                                // We hit the point but we don't really care
                                output({text: `Point of ${dice} hit`, color: 'black'});
                                point = 0;
                                isComeout = true;
                            }
                        
                            let payout: number;

                            if (dice === 6) {
                                payout = (amountOn6 / 6) * 7;
                            }
                            else {
                                payout = (amountOn8 / 6) * 7;
                            }
                            
                            if (payout > 0) {
                                output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                                this.currentBankrollRelativeToZero += payout;
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
                            amountOn6 = 0;
                            amountOn8 = 0;
                            amountOn5 = 0;
                            amountOn9 = 0

                            output({text: `Win/Loss for this shooter: $${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
                            winsAndLosses.push(this.currentBankrollRelativeToZero);
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