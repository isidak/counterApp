import {Component, OnDestroy, OnInit} from '@angular/core';
import {CounterStateService} from "../../services/counter-state/counter-state.service";
import {Observable, Subscription} from "rxjs";
import {Counter} from "../../types/counter/counter";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit, OnDestroy {
  count$: Observable<Partial<Counter>>;
  form: FormGroup;
  private subscription = new Subscription()

  get setToControl() {
    return this.form.get('setTo')
  }

  get tickSpeedControl() {
    return this.form.get('tickSpeed')
  }

  get countDiffControl() {
    return this.form.get('countDiff')
  }

  constructor(
    private counterState: CounterStateService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.createFormGroup();
    this.count$ = this.getCount();
    this.inputsSubscription();
    this.patchFormValues();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  start() {
    this.counterState.start();
  }

  pause() {
    this.counterState.pause()
  }

  countUp() {
    this.counterState.countUp()
  }

  countDown() {
    this.counterState.countDown()
  }

  setTo(value: any) {
    const count = typeof value === 'string' ? 0 : value
    this.counterState.setTo(count)
  }

  countDiff(value: number) {
    this.counterState.countDiff(value)
  }

  tickSpeed(value: number) {
    this.counterState.tickSpeed(value)
  }

  reset() {
    this.counterState.resetCounter();
    this.patchFormValues();
  }

  private getCount(): Observable<Partial<Counter>> {
    return this.counterState.getCount();
  }

  private createFormGroup(): FormGroup {
    return this.fb.group({
      setTo: ['', [Validators.required, Validators.minLength(1)]],
      tickSpeed: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
      countDiff: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
    });
  }

  private patchFormValues() {
    const initialState = this.counterState.getInitialCounterSnapshot();
    this.form.patchValue(initialState);
  }

  private inputsSubscription() {
    const tickSpeedSub = this.tickSpeedControl?.valueChanges.subscribe((tickSpeed) => this.counterState.tickSpeed(tickSpeed));
    const countDiffSub = this.countDiffControl?.valueChanges.subscribe((countDiff) => this.counterState.countDiff(countDiff));

    this.subscription.add(tickSpeedSub);
    this.subscription.add(countDiffSub);
  }
}
