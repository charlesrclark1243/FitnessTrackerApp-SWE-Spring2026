import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDisplayComponent } from './water-display';

describe('WaterDisplayComponent', () => {
  let component: WaterDisplayComponent;
  let fixture: ComponentFixture<WaterDisplayComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterDisplayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
