import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        provideRouter([]) // Provide empty routes
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  // Test 1: Service Creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

 
  // Test 2: Current User Value
  it('should return null for currentUserValue initially', () => {
    expect(service.currentUserValue).toBeNull();
  });

  // Test 3: Get Token
  it('should return null token when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  // Test 4: Login Success
  it('should login successfully and store user', (done) => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      token: 'fake-jwt-token'
    };

    service.login('testuser', 'password123').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUserValue).toEqual(mockUser);
      expect(service.getToken()).toBe('fake-jwt-token');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
    req.flush(mockUser);
  });

  // Test 5: Login saves to localStorage
  it('should save user to localStorage on login', (done) => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      token: 'fake-jwt-token'
    };

    service.login('testuser', 'password123').subscribe(() => {
      const stored = localStorage.getItem('currentUser');
      expect(stored).toBeTruthy();
      
      if (stored) {
        expect(JSON.parse(stored)).toEqual(mockUser);
      }
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    req.flush(mockUser);
  });

  // Test 6: Register Success
  it('should register successfully', (done) => {
    const mockUser = {
      id: '456',
      username: 'newuser',
      token: 'new-jwt-token',
      height: 175,
      weight: 70
    };

    const userData = {
      username: 'newuser',
      password: 'password123',
      height: 175,
      weight: 70,
      dateOfBirth: '1990-01-01',
      sex: 'male'
    };

    service.register(userData).subscribe(user => {
      expect(user.username).toBe('newuser');
      expect(service.isAuthenticated()).toBeTrue();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);
    req.flush(mockUser);
  });

 
 
});
