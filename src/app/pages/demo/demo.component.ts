import { Component, OnInit } from '@angular/core'
import { Subscription, of, Observable, interval, iif } from 'rxjs'
import { delay, tap, repeat, switchMap, takeUntil, map, delayWhen } from 'rxjs/operators'
import { Panel } from 'src/app/models/panel.model'

@Component({
  selector: 'scrap-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  accelerationDelay = 800
  accMax = 800
  accMin = 20
  EXPONENT = 1.05
  rampUp$: Observable<any>
  rampDown$: Observable<any>
  accSub: Subscription
  deaccSub: Subscription
  panel: Panel = {
    thickness: 1,
    durability: 100,
    value: 100,
    temperature: 27,
  }

  constructor() {
    const fullHeat$ = of(null).pipe(
      tap(() => this.accelerationDelay = this.accMin),
      switchMap(() => interval(this.accelerationDelay).pipe(
        tap(() => this.heatUp()),
      )),
    )
    this.rampUp$ = of(null).pipe(
      delayWhen(event => of(null).pipe(delay(this.accelerationDelay))),
      map(async () => {
        this.accelerationDelay = Math.pow(this.accelerationDelay, 1 / this.EXPONENT)
        this.heatUp()
      }),
      switchMap(() => iif(() => this.accelerationDelay <= this.accMin, fullHeat$, this.rampUp$)),
    )
    const zeroHeat$ = of(null).pipe(
      tap(() => this.accelerationDelay = this.accMax)
    )
    this.rampDown$ = of(null).pipe(
      delayWhen(event => of(null).pipe(delay(this.accelerationDelay))),
      tap(() => {
        this.accelerationDelay = Math.pow(this.accelerationDelay, this.EXPONENT)
        this.heatUp()
      }),
      switchMap(() => iif(() => this.accelerationDelay >= this.accMax, zeroHeat$, this.rampDown$)),
    )
  }

  ngOnInit(): void {
    // this.decayHeat()
  }

  currentDelay(): number {
    return this.accelerationDelay
  }

  public beginHeat(): void {
    if (this.deaccSub) {
      this.deaccSub.unsubscribe()
    }
    this.accSub = this.rampUp$.subscribe()
  }

  endHeat(): void {
    if (this.accSub) {
      this.accSub.unsubscribe()
      this.deaccSub = this.rampDown$.subscribe()
    }
  }

  decayHeat(): void {
    interval(500).pipe(
      tap(() => {
        this.panel.temperature -= 1
        this.panel.temperature = Math.max(this.panel.temperature, 27)
      })
    ).subscribe()
  }

  heatUp(): void {
    this.panel.temperature += 1
  }

  temperatureAngle(): number {
    return (this.panel.temperature - 27) / 1000 * 180
  }

  temperatureDial(): string {
    return `rotate(${this.temperatureAngle()}deg)`
  }
}
