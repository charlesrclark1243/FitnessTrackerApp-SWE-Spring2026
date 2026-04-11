import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalorieDisplayComponent } from './calorie-display';

describe('CalorieDisplay', () => {
  let component: CalorieDisplayComponent;
  let fixture: ComponentFixture<CalorieDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalorieDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalorieDisplayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
