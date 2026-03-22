import { TestBed } from '@angular/core/testing';

import { WaterService } from './water';

describe('WaterService', () => {
  let service: WaterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
