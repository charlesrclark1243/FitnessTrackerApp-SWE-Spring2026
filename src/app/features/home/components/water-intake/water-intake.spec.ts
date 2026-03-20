import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterIntake } from './water-intake';

describe('WaterIntake', () => {
  let component: WaterIntake;
  let fixture: ComponentFixture<WaterIntake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterIntake]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterIntake);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
