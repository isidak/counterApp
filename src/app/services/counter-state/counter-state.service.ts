import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  NEVER,
  Observable,
  scan,
  startWith,
  Subject,
  switchMap,
  timer,
  withLatestFrom
} from "rxjs";
import {Counter} from "../../types/counter/counter";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CounterStateService {
  private initialCounterConfig: Counter = {
    isTicking: false,
    count: 0,
    countUp: true,
    tickSpeed: 1000,
    countDiff: 1,
    setTo: 10
  }

  private initialCounter = new BehaviorSubject<Counter>(this.initialCounterConfig)
  private start$ = new Subject<Partial<Counter>>();
  private pause$ = new Subject<Partial<Counter>>();
  private countUp$ = new Subject<Partial<Counter>>();
  private countDown$ = new Subject<Partial<Counter>>();
  private countDiff$ = new Subject<Partial<Counter>>();
  private setTo$ = new Subject<Partial<Counter>>();
  private tickSpeed$ = new Subject<Partial<Counter>>();
  private programmaticCommand$ = new Subject<Partial<Counter>>();

  start() {
    this.start$.next({isTicking: true})
  }

  pause() {
    this.pause$.next({isTicking: false})
  }

  countUp() {
    this.countUp$.next({countUp: true})
  }

  countDown() {
    this.countUp$.next({countUp: false})
  }

  countDiff(value: number) {
    if (value > 0) {
      this.countDiff$.next({countDiff: value})
    }
  }

  setTo(value: number) {
    if (value !== null) {
      this.setTo$.next({count: value})
    }
  }

  tickSpeed(value: number) {
    if (value > 0) {
      this.tickSpeed$.next({tickSpeed: value})
    }
  }

  resetCounter() {
    this.programmaticCommand$.next(this.initialCounter.value)
  }

  private sourceEvents() {
    return merge(
      this.start$.pipe(distinctUntilChanged()),
      this.countUp$.pipe(distinctUntilChanged()),
      this.pause$.pipe(distinctUntilChanged()),
      this.countDown$.pipe(distinctUntilChanged()),
      this.countDiff$.pipe(distinctUntilChanged()),
      this.setTo$.pipe(distinctUntilChanged()),
      this.tickSpeed$.pipe(distinctUntilChanged()),
      this.programmaticCommand$.pipe(distinctUntilChanged())
    )
  }


  getCount(): Observable<Partial<Counter>> {
    return merge(
      this.commandFromTick(),
      this.counterState()
    ).pipe(
      filter((value) => !!value),
      map((state) => {
        return {count: state?.count}
      })
    )
  }

  getInitialCounterSnapshot(): Counter {
    return this.initialCounter.value
  }

  private counterState(): Observable<Counter> {
    return this.sourceEvents().pipe(
      startWith(this.initialCounter.value),
      scan((state, curr): any => ({...state, ...curr}))
    )
  }

  private getIsTicking(): Observable<boolean> {
    return this.counterState().pipe(
      map((state) => state.isTicking),
      distinctUntilChanged()
    )
  }

  private getTickSpeed(): Observable<number> {
    return this.counterState().pipe(
      map((state) => state.tickSpeed),
      distinctUntilChanged()
    )
  }

  private timerUpdateTrigger(): Observable<any> {
    return combineLatest([
      this.getIsTicking(),
      this.getTickSpeed()]
    ).pipe(
      switchMap(([isTicking, tickSpeed]) => isTicking ? timer(0, tickSpeed) : NEVER))
  }

  private commandFromTick(): Observable<null> {
    return this.timerUpdateTrigger().pipe(
      withLatestFrom(this.counterState()),
      tap(([command, state]) => this.programmaticCommand$.next(
          {count: state.count + state.countDiff * (state.countUp ? 1 : -1)}
        )
      ),
      map(() => null)
    )
  }

}
