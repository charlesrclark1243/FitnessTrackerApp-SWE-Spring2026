import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDisplay } from './water-display';

describe('WaterDisplay', () => {
  let component: WaterDisplay;
  let fixture: ComponentFixture<WaterDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
