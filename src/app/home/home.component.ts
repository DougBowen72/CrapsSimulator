import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IStrategy } from './strategy.model';
import { FormsModule } from '@angular/forms';
import { ColdTable } from './coldTable.model';
import { SixAndEight } from './sixAndEight.model';

@Component({
  selector: 'craps-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public strategies: IStrategy[];
  public error: string = '';
  public shooters: number = 0;
  public selectedStrategy: number = 0;
  public bettingUnit: number = 0;
  public output: {text: string, color: string}[] = [];
  public isRunning: boolean = false;
  
  constructor() {
    this.strategies = [
      {
        id: 1,
        name: 'Cold Table',
        description: `Max 4 units per shooter, don't pass, come, come, don't come, don't come (if enough units, max 2 don't come bets)`
      },
      {
        id: 2,
        name: '6 and 8',
        description: `Place 6 and 8, collect two hits, third hit place 5, 4th hit collect, 5th hit place 9, then collect all`
      }
    ];
  }

  public getSelectedStrategyDescription(): string {
    if (this.selectedStrategy > 0) {
      return this.strategies.filter(s => s.id == this.selectedStrategy)[0].description;
    }
    else {
      return '';
    }
    
  }

  public async runStrategy() {
    if (this.shooters < 1 || this.selectedStrategy < 1 || this.bettingUnit < 1) {
      this.error = 'Strategy, shooters and betting unit must be set';
      return;
    }
    
    this.isRunning = true;
    this.error = '';
    this.output.length = 0;
    await this.sleep(25);

    let fn = (s: {text: string, color: string}) => {
      this.output.push({text: s.text, color: s.color});
      console.info(s.text);
    }

    if (this.selectedStrategy == 1) {
      let coldTable: ColdTable = new ColdTable();

      coldTable.runSimulation(this.bettingUnit, this.shooters, fn);
    }
    else if (this.selectedStrategy == 2) {
      let sixAndEight: SixAndEight = new SixAndEight();

      sixAndEight.runSimulation(this.bettingUnit, this.shooters, fn);
    }
    else {
      this.error = 'Strategy not implemented';
    }
    this.isRunning = false;
    await this.sleep(1);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

}
