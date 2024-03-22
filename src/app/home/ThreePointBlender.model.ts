import { Common } from "./common.model";

export class ThreePointBlender {
    private _amountOnDontCome4: number = 0;
    private _amountOnDontCome5: number = 0;
    private _amountOnDontCome6: number = 0;
    private _amountOnDontCome8: number = 0;
    private _amountOnDontCome9: number = 0;
    private _amountOnDontCome10: number = 0;
    private _amountOnPlace4: number = 0;
    private _amountOnPlace5: number = 0;
    private _amountOnPlace6: number = 0;
    private _amountOnPlace8: number = 0;
    private _amountOnPlace9: number = 0;
    private _amountOnPlace10: number = 0;
    private _maxBankrollRelativeToZero: number = 0;
    private _minBankrollRelativeToZero: number = 0;
    private _output: Function = () => {};
    private _amountOnDontPass: number = 0;

    private _currentBankrollRelativeToZero: number = 0;
    private get currentBankrollRelativeToZero() {
        return this._currentBankrollRelativeToZero;
    }

    // Create an internal setter so we don't have to write the min and max and unitsOnHand logic every time the bankroll value changes.
    private set currentBankrollRelativeToZero(value: number) {
        this._output({text: `Bankroll: ${value}`, color: 'black'});

        this._currentBankrollRelativeToZero = value;
        if (this._currentBankrollRelativeToZero < this._minBankrollRelativeToZero) {
            this._minBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
        else if (this._currentBankrollRelativeToZero > this._maxBankrollRelativeToZero) {
            this._maxBankrollRelativeToZero = this._currentBankrollRelativeToZero;
        }
    }

    public async runSimulation(bettingUnit: number, shooters: number, output: (s: {text:string, color:string}) => void, incrementProgress: () => void) : Promise<number[]> {
        output({text: 'Starting simulation for 3 Point Blender strategy...', color: 'black'});

        let isComeout: boolean = true;
        let winsAndLosses: number[] = [];
        let amountOnDontCome: number = 0;
        let bankrollPreviousShooter: number = 0;
        // let dontComePointHit: boolean = false;

        this._output = output;

        // Figure this out once so we don't have to do this in both the 6 and 8.
        let place6or8Amount: number = 0;

        // Payout is 7:6 so we need to put an amount on the 6 that is divisible by 6
        if (bettingUnit % 6 == 0)
        {
            place6or8Amount = bettingUnit;
        }
        else {
            // Find the next multiple of 6
            let mult: number = Math.floor(bettingUnit / 6);
            place6or8Amount = (mult + 1) * 6;
        }
        
        for (let i: number = 0; i < shooters; i++)
        {
            incrementProgress();
            
            // Allows the page to refresh with the status bar and output
            await Common.sleep(1);

            let sevenOut: boolean = false;
            let point: number = 0;
            bankrollPreviousShooter = this.currentBankrollRelativeToZero;

            while (sevenOut === false) {
                let totalDontBets: number = this.totalAmountOnDontComeBets();
                totalDontBets += point > 0 ? bettingUnit : 0;

                if (isComeout) {
                    if (this._amountOnDontPass < 1) {
                        if (totalDontBets <= this.totalAmountOnPlaceBets()) {
                            this.removePlaceBetFromOutermostNumber(point, bettingUnit, output);
                        }
                        
                        this._amountOnDontPass = bettingUnit;
                        output({text: `Putting $${bettingUnit} on the Don't Pass`, color: 'black'});
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                }
                else {
                    if (this.totalAmountOnDontComeBets() < bettingUnit * 2 && amountOnDontCome < 1) {
                        if (totalDontBets <= this.totalAmountOnPlaceBets()) {
                            this.removePlaceBetFromOutermostNumber(point, bettingUnit, output);
                        }

                        // No more than 2 don't come bets
                        amountOnDontCome = bettingUnit;
                        output({text: `Putting $${bettingUnit} on the Don't Come`, color: 'black'});
                        this.currentBankrollRelativeToZero -= bettingUnit;
                    }
                
                    // Set any necessary place bets
                    this.setPlaceBets(point, bettingUnit, place6or8Amount, output);
                }

                // dontComePointHit = false;

                if (isComeout) { output({text: `Coming out...`, color: 'black'}); }
                let dice = Common.rollDice();
                output({text: `${dice} rolled`, color: 'black'});

                switch (dice) {
                    case 2:
                    case 3:
                        if (isComeout) {
                            if (this._amountOnDontPass > 0) {
                                this.currentBankrollRelativeToZero += bettingUnit * 2;
                                output({text: `Won the don't pass for $${this._amountOnDontPass}, pulling down bet and winnings`, color: 'black'});
                                this._amountOnDontPass = 0;
                            }
                        }

                        if (amountOnDontCome > 0) {
                            this.currentBankrollRelativeToZero += bettingUnit * 2;
                            output({text: `Won the don't come for $${amountOnDontCome}, pulling down bet and winnings`, color: 'black'});
                            amountOnDontCome = 0;
                        }
                        break;
                    case 4:
                        // Win a place bet on 4
                        if (this._amountOnPlace4 > 0) {
                            // Pay the bet 9:5 and take it all down
                            let payout: number = (this._amountOnPlace4 / 5) * 9;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace4}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace4;
                            this._amountOnPlace4 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 4
                        if (this._amountOnDontCome4 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome4 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome4 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number
                            this._amountOnPlace4 = bettingUnit;
                            output({text: `Placing the ${dice} for $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit;
                        }
                        

                        break;
                    case 5:
                        // Win a place bet on 5
                        if (this._amountOnPlace5 > 0) {
                            // Pay the bet 7:5 and take it all down
                            let payout: number = (this._amountOnPlace5 / 5) * 7;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace5}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace5;
                            this._amountOnPlace5 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 5
                        if (this._amountOnDontCome5 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome5 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome5 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number
                            this._amountOnPlace5 = bettingUnit;
                            output({text: `Placing the ${dice} for $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit;
                        }

                        break;
                    case 6:
                        // Win a place bet on 6
                        if (this._amountOnPlace6 > 0) {
                            // Pay the bet 7:6 and take it all down
                            let payout: number = (this._amountOnPlace6 / 6) * 7;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace6}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace6;
                            this._amountOnPlace6 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 6
                        if (this._amountOnDontCome6 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome6 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome6 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number.
                            this._amountOnPlace6 = place6or8Amount;
                            output({text: `Placing the ${dice} for $${place6or8Amount}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= place6or8Amount;
                        }

                        break;
                    case 7:
                        // Win don't come bets
                        this.winDontComeBets(output);

                        // Place bets are always working
                        this.losePlaceBets(output);

                        if (isComeout) {
                            if (this._amountOnDontPass > 0) {
                                output({text: `Lost the don't pass`, color: 'black'});
                                this._amountOnDontPass = 0;
                            }
                        }
                        else {
                            output({text: 'Seven out', color: 'black'});

                            if (this._amountOnDontPass > 0) {
                                output({text: `Won the don't pass for $${this._amountOnDontPass}, pulling down bet and winnings`, color: 'black'});
                                this.currentBankrollRelativeToZero += bettingUnit * 2; // Collect original bet and 1:1 winnings
                                this._amountOnDontPass = 0
                            }

                            if (amountOnDontCome > 0) {
                                output({text: `Lost the don't come`, color: 'black'});
                                amountOnDontCome = 0;
                            }

                            sevenOut = true;  // Move on to the next shooter.
                            isComeout = true;
                            let winLoss = this.currentBankrollRelativeToZero - bankrollPreviousShooter;
                            output({text: `Win/Loss for this shooter: $${ winLoss > 0 ? '+' : '' }${winLoss}`, color: 'red'});
                            output({text: `Cumulative win/loss: $${ this.currentBankrollRelativeToZero > 0 ? '+' : '' }${this.currentBankrollRelativeToZero}`, color: 'red'});
                            winsAndLosses.push(this.currentBankrollRelativeToZero);
                        }
                        break;
                    case 8:
                        // Win a place bet on 8
                        if (this._amountOnPlace8 > 0) {
                            // Pay the bet 7:6 and take it all down
                            let payout: number = (this._amountOnPlace8 / 6) * 7;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace8}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace8;
                            this._amountOnPlace8 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 8
                        if (this._amountOnDontCome8 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome8 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome8 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number
                            this._amountOnPlace8 = place6or8Amount;
                            output({text: `Placing the ${dice} for $${place6or8Amount}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= place6or8Amount;
                        }

                        break;
                    case 9:
                        // Win a place bet on 9
                        if (this._amountOnPlace9 > 0) {
                            // Pay the bet 7:5 and take it all down
                            let payout: number = (this._amountOnPlace9 / 5) * 7;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace9}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace9;
                            this._amountOnPlace9 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 9
                        if (this._amountOnDontCome9 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome9 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome9 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number
                            this._amountOnPlace9 = bettingUnit;
                            output({text: `Placing the ${dice} for $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit;
                        }

                        break;
                    case 10:
                        // Win a place bet on 10
                        if (this._amountOnPlace10 > 0) {
                            // Pay the bet 9:5 and take it all down
                            let payout: number = (this._amountOnPlace10 / 5) * 9;
                            output({text: `Won the ${dice} for $${payout}`, color: 'black'});
                            this.currentBankrollRelativeToZero += payout;
                            output({text: `Taking down the place bet on the ${dice} of $${this._amountOnPlace10}`, color: 'black'});
                            this.currentBankrollRelativeToZero += this._amountOnPlace10;
                            this._amountOnPlace10 = 0;
                        }

                        if (isComeout) {
                            point = dice;
                            isComeout = false;
                            output({text: `Point is ${dice}`, color: 'black'});
                        }
                        else if (point === dice) {
                            // We hit the point so we lose our don't pass bet
                            output({text: `Point of ${dice} hit`, color: 'black'});
                            if (this._amountOnDontPass > 0) { output({text: `Lost don't pass`, color: 'black'}); }
                            this._amountOnDontPass = 0;
                            point = 0;
                            isComeout = true;
                        }

                        // Lose a don't come bet on 10
                        if (this._amountOnDontCome10 > 0) {
                            output({text: `Lost don't come on ${dice}`, color: 'black'});
                            this._amountOnDontCome10 = 0;
                        }

                        if (amountOnDontCome > 0) {
                            // Move the don't come to the number
                            this._amountOnDontCome10 = bettingUnit;
                            amountOnDontCome = 0;
                            output({text: `Moving don't come bet to ${dice}`, color: 'black'});
                            
                            // Place the don't come number
                            this._amountOnPlace10 = bettingUnit;
                            output({text: `Placing the ${dice} for $${bettingUnit}`, color: 'black'});
                            this.currentBankrollRelativeToZero -= bettingUnit;
                        }

                        break;
                    case 11:
                        // Lose the don't pass on the comeout
                        if (isComeout) {
                            this._amountOnDontPass = 0;
                            output({text: `Lost the Don't Pass`, color: 'black'});
                        }

                        // Lose the don't come
                        if (amountOnDontCome > 0) { output({text: `Lost the Don't Come`, color: 'black'});}
                        amountOnDontCome = 0;
                        break;
                    case 12:
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

    private setPlaceBets(point: number, bettingUnit: number, sixAndEightPlaceAmount: number, output: (s: {text:string, color:string}) => void) {
        if (point > 0 && this.totalAmountOnDontComeBets() == bettingUnit * 2) {
            // Three numbers are set so make sure all don't come numbers and the point number have place bets.
            if ((this._amountOnDontCome4 > 0 || point === 4) && this._amountOnPlace4 === 0) {
                output({text: `Placing the 4 for $${bettingUnit}`, color: 'black'});
                this._amountOnPlace4 = bettingUnit;
                this.currentBankrollRelativeToZero -= bettingUnit;
            }
            if ((this._amountOnDontCome5 > 0 || point === 5) && this._amountOnPlace5 === 0) {
                output({text: `Placing the 5 for $${bettingUnit}`, color: 'black'});
                this._amountOnPlace5 = bettingUnit;
                this.currentBankrollRelativeToZero -= bettingUnit;
            }
            if ((this._amountOnDontCome6 > 0 || point === 6) && this._amountOnPlace6 === 0) {
                output({text: `Placing the 6 for $${sixAndEightPlaceAmount}`, color: 'black'});
                this._amountOnPlace6 = sixAndEightPlaceAmount;
                this.currentBankrollRelativeToZero -= sixAndEightPlaceAmount;
            }
            if ((this._amountOnDontCome8 > 0 || point === 8) && this._amountOnPlace8 === 0) {
                output({text: `Placing the 8 for $${sixAndEightPlaceAmount}`, color: 'black'});
                this._amountOnPlace8 = sixAndEightPlaceAmount;
                this.currentBankrollRelativeToZero -= sixAndEightPlaceAmount;
            }
            if ((this._amountOnDontCome9 > 0 || point === 9) && this._amountOnPlace9 === 0) {
                output({text: `Placing the 9 for $${bettingUnit}`, color: 'black'});
                this._amountOnPlace9 = bettingUnit;
                this.currentBankrollRelativeToZero -= bettingUnit;
            }
            if ((this._amountOnDontCome10 > 0 || point === 10) && this._amountOnPlace10 === 0) {
                output({text: `Placing the 10 for $${bettingUnit}`, color: 'black'});
                this._amountOnPlace10 = bettingUnit;
                this.currentBankrollRelativeToZero -= bettingUnit;
            }
        }
        else {
            // Less than three numbers are set so we don't need to do anything here.
        }
    }

    private losePlaceBets(output: (s: {text:string, color:string}) => void): void {
        if (this._amountOnPlace4 > 0) {
            this._amountOnPlace4 = 0;
            output({text: `Lost place bet on 4`, color: 'black'});
        }
        if (this._amountOnPlace5 > 0) {
            this._amountOnPlace5 = 0;
            output({text: `Lost place bet on 5`, color: 'black'});
        }
        if (this._amountOnPlace6 > 0) {
            this._amountOnPlace6 = 0;
            output({text: `Lost place bet on 6`, color: 'black'});
        }
        if (this._amountOnPlace8 > 0) {
            this._amountOnPlace8 = 0;
            output({text: `Lost place bet on 8`, color: 'black'});
        }
        if (this._amountOnPlace9 > 0) {
            this._amountOnPlace9 = 0;
            output({text: `Lost place bet on 9`, color: 'black'});
        }
        if (this._amountOnPlace10 > 0) {
            this._amountOnPlace10 = 0;
            output({text: `Lost place bet on 10`, color: 'black'});
        }
    }

    private removePlaceBetFromOutermostNumber(point: number, bettingUnit: number, output: (s: {text:string, color:string}) => void): void {
        // The assumption here is that we are making a bet and we do need to take a place be down.

        if (this._amountOnPlace4 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace4} from the 4 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace4;
            this._amountOnPlace4 = 0;
        }
        else if (this._amountOnPlace10 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace10} from the 10 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace10;
            this._amountOnPlace10 = 0;
        }
        else if (this._amountOnPlace5 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace5} from the 5 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace5;
            this._amountOnPlace5 = 0;
        }
        else if (this._amountOnPlace9 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace9} from the 9 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace9;
            this._amountOnPlace9 = 0;
        }
        else if (this._amountOnPlace6 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace6} from the 6 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace6;
            this._amountOnPlace6 = 0;
        }
        else if (this._amountOnPlace8 > 0) {
            output({text: `Removing place bet of $${this._amountOnPlace8} from the 8 to use for next bet`, color: 'black'});
            this.currentBankrollRelativeToZero += this._amountOnPlace8;
            this._amountOnPlace8 = 0;
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
        let total: number = 0;

        total += this._amountOnDontCome4;
        total += this._amountOnDontCome5;
        total += this._amountOnDontCome6;
        total += this._amountOnDontCome8;
        total += this._amountOnDontCome9;
        total += this._amountOnDontCome10;

        return total;
    }

    private totalAmountOnPlaceBets() : number {
        return this._amountOnPlace4 + this._amountOnPlace5 + this._amountOnPlace6 + this._amountOnPlace8 + this._amountOnPlace9 + this._amountOnPlace10;
    }
}