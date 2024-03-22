import { Common } from "./common.model";

export class Feed5And9 {
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
    public async runSimulation(bettingUnit: number, shooters: number, output: (s: {text:string, color:string}) => void, incrementProgress: () => void) : Promise<number[]> {
        output({text: 'Starting simulation for Feed the 5 and 9 strategy...', color: 'black'});

        let isComeout: boolean = true;
        let winsAndLosses: number[] = [];
        let amountOn5: number = 0;
        let amountOn6: number = 0;
        let amountOn8: number = 0;
        let amountOn9: number = 0;
        let sixAndEightBet: number = 0;

        let rem: number = bettingUnit % 6;

        if (rem == 0)
        {
            // This is unlikely as the betting unit is not likely to be a multiple of 6 but just in case...
            sixAndEightBet = bettingUnit;

            // amountOn6 = bettingUnit;
            // output({text: `Placing the 6 for $${bettingUnit}`, color: 'black'});
            // amountOn8 = bettingUnit;
            // output({text: `Placing the 8 for $${bettingUnit}`, color: 'black'});
            // this.currentBankrollRelativeToZero -= bettingUnit * 2;
        }
        else {
            // Find the next multiple of 6 and put that on both the 6 and 8
            let mult: number = Math.floor(bettingUnit / 6);
            sixAndEightBet = (mult + 1) * 6;

            // amountOn6 = amountOn8 = (mult + 1) * 6;
            // output({text: `Placing the 6 for $${amountOn6}`, color: 'black'});
            // amountOn8 = amountOn6;
            // output({text: `Placing the 8 for $${amountOn8}`, color: 'black'});
            // this.currentBankrollRelativeToZero -= (amountOn6 + amountOn8);
        }


        // There will always be money on the 6 and 8 so figure this out once
        let sixAndEightPayout: number = (sixAndEightBet / 6) * 7;

        // Payout is 7:5 so we need to put an amount on the 5/9 that is divisible by 5
        //let rem: number = sixAndEightPayout % 5;

        let addition: number;

        // Find the previous multiple of 5
        let mult: number = Math.floor(sixAndEightPayout / 5);
        addition = mult * 5;

        // Now figure out how much we will collect since the 6 and 8 payout will be more than what we put on the 5/9
        let addBackToBankroll: number = sixAndEightPayout - addition;
        
        // Now spin the shooters
        for (let i: number = 0; i < shooters; i++)
        {
            incrementProgress();
            
            // Allows the page to refresh with the status bar and output
            await Common.sleep(1);

            let sevenOut: boolean = false;
            let point: number = 0;
            this._bankrollPreviousShooter = this.currentBankrollRelativeToZero;

            while (sevenOut === false) {
                // Set the bets
                if (isComeout) {
                    // No line bets
                    // The 6 and 8 will be off on the comeout but we'll place them here because it's simplest this way.
                    if (amountOn6 === 0) {
                        output({text: `Placing the 6 for $${sixAndEightBet}`, color: 'black'});
                        amountOn6 = sixAndEightBet;
                        this.currentBankrollRelativeToZero -= sixAndEightBet;
                        output({text: `Placing the 8 for $${sixAndEightBet}`, color: 'black'});
                        amountOn8 = sixAndEightBet;
                        this.currentBankrollRelativeToZero -= sixAndEightBet;
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

                            output({text: `Won the ${dice} for $${sixAndEightPayout}, adding $${addition} to the ${dice === 6 ? '5' : '9'} for a total of $${(dice === 6 ? amountOn5 : amountOn9) + addition}, along with $${addBackToBankroll} going back to the bankroll`, color: 'black'});
                            
                            if (dice === 6) {
                                amountOn5 += addition
                            }
                            else {
                                amountOn9 += addition
                            }
                            
                            this.currentBankrollRelativeToZero += addBackToBankroll;
                        }

                        break;
                    case 5:
                    case 9:
                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            if (amountOn5 > 0 || amountOn9 > 0) {
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

                            if (dice === 5) {
                                payout = (amountOn5 / 5) * 7;
                            }
                            else {
                                payout = (amountOn9 / 5) * 7;
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