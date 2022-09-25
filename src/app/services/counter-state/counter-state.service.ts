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

  /**
   * Get initial counter count
   * @return {Observable<number | undefined>}
   */
  getCount(): Observable<number | undefined> {
    return merge(
      this.commandFromTick(),
      this.counterState()
    ).pipe(
      filter((value) => !!value),
      map((state) => state?.count)
    )
  }

  /**
   * Get initial counter state value
   * @return {Counter}
   */
  getInitialCounterSnapshot(): Counter {
    return this.initialCounter.value
  }

  /**
   * Combines all input events into one stream
   * @return {Observable<Partial<Counter>>}
   */
  private sourceEvents(): Observable<Partial<Counter>> {
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

  /**
   * Creates current counter state based on source events
   * @return {Observable<Counter>}
   */
  private counterState(): Observable<Counter> {
    return this.sourceEvents().pipe(
      startWith(this.initialCounter.value),
      scan((state, curr): any => ({...state, ...curr}))
    )
  }

  /**
   * Changes counter state when counter is running
   * @return {Observable<null>}
   */
  private commandFromTick(): Observable<null> {
    return this.counterUpdateTrigger().pipe(
      withLatestFrom(this.counterState()),
      tap(([command, state]) => this.programmaticCommand$.next(
          {count: state.count + state.countDiff * (state.countUp ? 1 : -1)}
        )
      ),
      map(() => null)
    )
  }

  /**
   * Triggers counter to run based on isTicking and TickSpeed events
   * @return {Observable<0>}
   */
  private counterUpdateTrigger(): Observable<any> {
    return combineLatest([
      this.getIsTicking(),
      this.getTickSpeed()]
    ).pipe(
      switchMap(([isTicking, tickSpeed]) => isTicking ? timer(0, tickSpeed) : NEVER))
  }

  /**
   * Monitors change of isTicking state of the counter
   * @return {Observable<boolean>}
   */
  private getIsTicking(): Observable<boolean> {
    return this.counterState().pipe(
      map((state) => state.isTicking),
      distinctUntilChanged()
    )
  }

  /**
   * Monitors tickSpeed state of the counter
   * @return {Observable<number>}
   */
  private getTickSpeed(): Observable<number> {
    return this.counterState().pipe(
      map((state) => state.tickSpeed),
      distinctUntilChanged()
    )
  }

}
