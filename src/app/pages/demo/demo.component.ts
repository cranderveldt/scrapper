import { Component } from '@angular/core'
import { Subscription, of, Observable, interval, iif } from 'rxjs'
import { delay, tap, switchMap, map, delayWhen } from 'rxjs/operators'
import { Panel } from 'src/app/models/panel.model'
import { Constants } from 'src/app/models/constants.model'

@Component({
  selector: 'scrap-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})

export class DemoComponent {
  accelerationDelay = 800
  accMax = 800
  accMin = 20
  EXPONENT = 1.05
  heatInc = 0
  private readonly heatIncMax = 20
  rampUp$: Observable<any>
  rampDown$: Observable<any>
  subscriptions: Subscription[] = []
  panel: Panel
  constants: Constants

  constructor(
  ) {
    this.constants = new Constants()
    this.panel = {
      thickness: 1,
      durability: 100,
      value: 100,
      temperature: this.constants.MIN_TEMP,
    }

    this.rampUp$ = interval(this.constants.INTERVAL).pipe(
      tap(() => {
        this.heatUp()
        if (this.heatInc < this.heatIncMax) {
          this.heatInc += (1 / 16)
          this.heatInc = Math.min(this.heatInc, this.heatIncMax)
        }
      })
    )

    this.rampDown$ = interval(this.constants.INTERVAL).pipe(
      tap(() => {
        this.heatUp()
        if (this.heatInc > 0) {
          this.heatInc -= (1 / 8)
          this.heatInc = Math.max(this.heatInc, 0)
        }
      })
    )
  }

  public beginHeat(): void {
    this.unsubscribe()
    this.subscriptions.push(this.rampUp$.subscribe())
  }

  public endHeat(): void {
    this.unsubscribe()
    this.subscriptions.push(this.rampDown$.subscribe())
  }

  unsubscribe(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  decayHeat(): void {
    interval(this.constants.INTERVAL).pipe(
      tap(() => {
        this.panel.temperature -= 1
        this.panel.temperature = Math.max(this.panel.temperature, this.constants.MIN_TEMP)
      })
    ).subscribe()
  }

  heatUp(): void {
    this.panel.temperature += this.heatInc
  }

  temperatureAngle(): number {
    return (this.panel.temperature - this.constants.MIN_TEMP) / this.constants.MAX_TEMP * 270
  }

  temperatureDial(): string {
    return `rotate(${this.temperatureAngle()}deg)`
  }

  displayTemperature(): string {
    return `${Math.floor(this.panel.temperature) / 100} K`
  }

  generateArray(num: number): any[] {
    const array = []
    for (let i = 0; i < num; i++) {
      array.push(i)
    }
    return array
  }
}
