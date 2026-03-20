import { TestBed } from '@angular/core/testing';

import { Water } from './water';

describe('Water', () => {
  let service: Water;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Water);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
