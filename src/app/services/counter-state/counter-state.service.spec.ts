import { TestBed } from '@angular/core/testing';

import { CounterStateService } from './counter-state.service';

describe('TimerStateService', () => {
  let service: CounterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
