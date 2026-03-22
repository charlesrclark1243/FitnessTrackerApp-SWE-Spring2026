import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navigation component', () => {
    expect(component).toBeTruthy();
  });

  it('should have isAuthenticated observable', () => {
    expect(component.isAuthenticated$).toBeTruthy();
  });

  it('should have username observable', () => {
    expect(component.username$).toBeTruthy();
  });

  it('should have logout method', () => {
    expect(component.logout).toBeTruthy();
    expect(typeof component.logout).toBe('function');
  });
});
