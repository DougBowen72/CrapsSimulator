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
import { ProgressBarModule } from "@progress/kendo-angular-progressbar";
import { Product } from './product';
//import 'hammerjs';
import { ChildComponentComponent } from '../child-component/child-component.component';
import { ThreePointBlender } from './ThreePointBlender.model';
import { Feed6And8 } from './feed6And8.model';
import { Feed5And9 } from './feed5And9.model';

@Component({
  selector: 'craps-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, GridModule, ChildComponentComponent, ProgressBarModule],
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
  public maxDontComeBets: number = 2;
  public winLossData: number[] = [];
  public seriesData: number[] = [1, 2, 3, 5];
  public progressValue: number = 0;

  public seriesLabels: SeriesLabels = {
    visible: true, // Note that visible defaults to false
    padding: 3,
    font: "bold 8px Arial, sans-serif",
  };

  constructor() {
    this.strategies = [
      {
        id: 1,
        name: 'Cold Table',
        description: `Max 4 units per shooter, don't pass, come, come, don't come, don't come (if enough units, up to max don't come bets). Once you go dark stay dark. If any don't come bets are in place, no more come bets.`
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
        description: `Same as Cold Table but keep trying to get 2 come bets even if don't comes are in place`
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
      },
      {
        id: 10,
        name: '3 Point Blender',
        description: `Don't pass, don't come, place don't come number, 2nd don't come, place 2nd don't come number, then place the don't pass number. Place bets are always working.`
      },
      {
        id: 11,
        name: 'Feed the 6 and 8',
        description: `Place the 5 and 9 (not working on come out), when 5 hits put winnings on 6, when 9 hits put winnings on 8, when 6 or 8 hit, collect.`
      },
      {
        id: 12,
        name: 'Feed the 5 and 9',
        description: `Place the 6 and 8 (not working on come out), when 6 hits put winnings on 5, when 8 hits put winnings on 9, when 5 or 9 hit, collect.`
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
    this.progressValue = 0;
    //await this.sleep(25);

    // while (true) {
    //   await this.sleep(50);
    //   this.progressValue++;
    //   if (this.progressValue > this.shooters) break;
    // }
    // return;

    let output = (s: {text: string, color: string}) => {
      // If there are more than 100 shooters we're not going to be looking at the individual rolls so don't bother logging them because it slows the process down.
      if (this.shooters <= 100) {
        this.output.push({text: s.text, color: s.color});
      }
      
      //console.info(s.text);
    }

    let incrementProgress = () => {
      this.progressValue++;
    }

    switch (this.selectedStrategy) {
      case 1:
          let coldTable: ColdTable = new ColdTable();
          //coldTable.onNextShooter = async () => { this.progressValue++; };
          this.winLossData = await coldTable.runSimulation(this.bettingUnit, this.shooters, this.maxDontComeBets, output, incrementProgress);
          break;
      case 2:
          let sixAndEight: SixAndEight = new SixAndEight();
          this.winLossData = await sixAndEight.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 3:
          let passLineOnly: PassLineOnly = new PassLineOnly();
          this.winLossData = await passLineOnly.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, this.maxComeBets, output, incrementProgress);
          break;
      case 4:
          let modifiedColdTable: ModifiedColdTable = new ModifiedColdTable();
          this.winLossData = await modifiedColdTable.runSimulation(this.bettingUnit, this.shooters, this.maxDontComeBets, output, incrementProgress);
          break;
      case 5:
          let sixAndEightOnly: SixAndEightOnly = new SixAndEightOnly();
          this.winLossData = await sixAndEightOnly.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 6:
          let ironCross: IronCross = new IronCross();
          this.winLossData = await ironCross.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 7:
          let knockout: Knockout = new Knockout();
          this.winLossData = await knockout.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, output, incrementProgress);
          break;
      case 8:
          let passWith6And8: PassLineWithSixAndEight = new PassLineWithSixAndEight();
          this.winLossData = await passWith6And8.runSimulation(this.bettingUnit, this.shooters, this.oddsMultipe, output, incrementProgress);
          break;
      case 9:
          let choppy: ChoppyTable = new ChoppyTable();
          this.winLossData = await choppy.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 10:
          let blender: ThreePointBlender = new ThreePointBlender();
          this.winLossData = await blender.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 11:
          let feed: Feed6And8 = new Feed6And8();
          this.winLossData = await feed.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
      case 12:
          let feed5And9: Feed5And9 = new Feed5And9();
          this.winLossData = await feed5And9.runSimulation(this.bettingUnit, this.shooters, output, incrementProgress);
          break;
        default:
        this.error = 'Strategy not implemented';
    }

    // Add a starting point
    this.winLossData.splice(0, 0, 0);
    this.isRunning = false;
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
}
