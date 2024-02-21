import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { IStrategy } from './strategy.model';
import { FormsModule } from '@angular/forms';
import { ColdTable } from './coldTable.model';
import { SixAndEight } from './sixAndEight.model';
import { PassLineOnly } from './passLineOnly.model';
import { ModifiedColdTable } from './modifiedColdTable.model';
import { SixAndEightOnly } from './sixAndEightOnly.model';
import { ChartModule } from '@progress/kendo-angular-charts';
import { SeriesLabels } from "@progress/kendo-angular-charts";
import { IronCross } from './ironCross.model';
import { Knockout } from './knockout.model';
import { PassLineWithSixAndEight } from './passlineWithSixAndEight.model';
import { ChoppyTable } from './choppyTable.model';
import { GridModule } from "@progress/kendo-angular-grid";
import { Product } from './product';
import 'hammerjs';
import { ChildComponentComponent } from '../child-component/child-component.component';

@Component({
  selector: 'craps-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, GridModule, ChildComponentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {

  public strategies: IStrategy[];
  public error: string = '';
  public shooters: number = 0;
  public selectedStrategy: number = 0;
  public bettingUnit: number = 10;
  public output: {text: string, color: string}[] = [];
  public isRunning: boolean = false;
  public oddsMultipe: number = 1;
  public maxComeBets: number = 3;
  public winLossData: number[] = [];
  public seriesData: number[] = [1, 2, 3, 5];

  public seriesLabels: SeriesLabels = {
    visible: true, // Note that visible defaults to false
    padding: 3,
    font: "bold 8px Arial, sans-serif",
  };

  public gridData: Product[] = [
    {
      ProductID: 1,
      ProductName: "Chai",
      UnitPrice: 18,
      Category: {
        CategoryID: 1,
        CategoryName: "Beverages",
      },
    },
    {
      ProductID: 2,
      ProductName: "Chang",
      UnitPrice: 19,
      Category: {
        CategoryID: 1,
        CategoryName: "Beverages",
      },
    },
    {
      ProductID: 3,
      ProductName: "Aniseed Syrup",
      UnitPrice: 10,
      Category: {
        CategoryID: 2,
        CategoryName: "Condiments",
      },
    },
  ];

  constructor() {
    this.strategies = [
      {
        id: 1,
        name: 'Cold Table',
        description: `Max 4 units per shooter, don't pass, come, come, don't come, don't come (if enough units, max 2 don't come bets). Once you go dark stay dark. If any don't come bets are in place, no more come bets.`
      },
      {
        id: 2,
        name: '6 and 8, build to 5 and 9',
        description: `Place 6 and 8, collect two hits, third hit place 5, 4th hit collect, 5th hit place 9, then collect all`
      },
      {
        id: 3,
        name: 'Pass line',
        description: `Pass line and come bets with an odds multiple`
      },
      {
        id: 4,
        name: 'Modified Cold Table',
        description: `Same as Cold Table but keep trying to get 2 come bets even if two don't comes are in place`
      },
      {
        id: 5,
        name: 'Place 6 and 8 only',
        description: `Place the 6 and 8 and collect every time.`
      },
      {
        id: 6,
        name: 'Iron Cross',
        description: `After the point is established, bet one unit on the Field and place the 5, 6 and 8.`
      },
      {
        id: 7,
        name: 'Knockout',
        description: `A "doey-don't" strategy. Passline with odds, don't pass without odds.`
      },
      {
        id: 8,
        name: 'Pass line with 6 and 8',
        description: `Passline with odds and place the 6 and 8 (or 5 or 9 if the point is 6 or 8)`
      },
      {
        id: 9,
        name: 'Choppy table',
        description: `Don't pass, don't come, 2 units on come`
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
    this.winLossData = [];
    await this.sleep(25);

    let output = (s: {text: string, color: string}) => {
      this.output.push({text: s.text, color: s.color});
      console.info(s.text);
    }

    switch (this.selectedStrategy) {
      case 1:
          let coldTable: ColdTable = new ColdTable();
          this.winLossData = coldTable.runSimulation(this.bettingUnit, this.shooters, output);
          break;
      case 2:
          let sixAndEight: SixAndEight = new SixAndEight();
          this.winLossData = sixAndEight.runSimulation(this.bettingUnit, this.shooters, output);
          break;
      case 3:
          let passLineOnly: PassLineOnly = new PassLineOnly();
          this.winLossData = passLineOnly.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, this.maxComeBets, output)
          break;
      case 4:
          let modifiedColdTable: ModifiedColdTable = new ModifiedColdTable();
          this.winLossData = modifiedColdTable.runSimulation(this.bettingUnit, this.shooters, output)
          break;
      case 5:
          let sixAndEightOnly: SixAndEightOnly = new SixAndEightOnly();
          this.winLossData = sixAndEightOnly.runSimulation(this.bettingUnit, this.shooters, output)
          break;
      case 6:
          let ironCross: IronCross = new IronCross();
          this.winLossData = ironCross.runSimulation(this.bettingUnit, this.shooters, output)
          break;
      case 7:
          let knockout: Knockout = new Knockout();
          this.winLossData = knockout.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, output)
          break;
      case 8:
          let passWith6And8: PassLineWithSixAndEight = new PassLineWithSixAndEight();
          this.winLossData = passWith6And8.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, output)
          break;
      case 9:
          let choppy: ChoppyTable = new ChoppyTable();
          this.winLossData = choppy.runSimulation(this.bettingUnit, this.shooters, output)
          break;
      default:
        this.error = 'Strategy not implemented';
    }

    // Add a starting point
    this.winLossData.splice(0, 0, 0);
    this.isRunning = false;
    await this.sleep(1);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
}
