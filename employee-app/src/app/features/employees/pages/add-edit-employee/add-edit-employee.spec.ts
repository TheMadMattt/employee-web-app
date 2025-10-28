import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditEmployee } from './add-edit-employee';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Gender } from '../../models/employee';

describe('AddEditEmployee', () => {
  let component: AddEditEmployee;
  let fixture: ComponentFixture<AddEditEmployee>;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  let router: Router;
  let routeId: string | null;

  const mockEmployee = {
    id: 1,
    registrationNumber: '00000001',
    firstName: 'Jan',
    lastName: 'Kowalski',
    gender: Gender.MALE
  };

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', [
      'getEmployeeById',
      'addEmployee',
      'updateEmployee'
    ]);

    routeId = null;
    const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    paramMapSpy.get.and.callFake((key: string) => routeId);

    await TestBed.configureTestingModule({
      imports: [AddEditEmployee],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: paramMapSpy
            }
          }
        },
        provideRouter([])
      ]
    })
    .compileComponents();

    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  describe('Add mode', () => {
    beforeEach(() => {
      routeId = null;
      fixture = TestBed.createComponent(AddEditEmployee);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.employeeForm).toBeDefined();
      expect(component.employeeForm.get('firstName')?.value).toBe('');
      expect(component.employeeForm.get('lastName')?.value).toBe('');
      expect(component.employeeForm.get('gender')?.value).toBe(Gender.MALE);
    });

    it('should have correct title in add mode', () => {
      expect(component.title()).toBe(component.t['ADD_NEW_EMPLOYEE']);
    });

    it('should have required validators on firstName', () => {
      const firstName = component.employeeForm.get('firstName');
      firstName?.setValue('');
      expect(firstName?.hasError('required')).toBe(true);
    });

    it('should have required validators on lastName', () => {
      const lastName = component.employeeForm.get('lastName');
      lastName?.setValue('');
      expect(lastName?.hasError('required')).toBe(true);
    });
  });

  describe('Form submission - Add mode', () => {
    beforeEach(() => {
      routeId = null;
      employeeService.addEmployee.and.returnValue(of(mockEmployee));
      fixture = TestBed.createComponent(AddEditEmployee);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not submit when form is invalid', () => {
      component.employeeForm.patchValue({
        firstName: '',
        lastName: '',
        gender: Gender.MALE
      });

      component.onSubmit();

      expect(employeeService.addEmployee).not.toHaveBeenCalled();
    });

    it('should mark all fields as dirty when form is invalid', () => {
      component.employeeForm.patchValue({
        firstName: '',
        lastName: ''
      });

      component.onSubmit();

      expect(component.employeeForm.get('firstName')?.dirty).toBe(true);
      expect(component.employeeForm.get('lastName')?.dirty).toBe(true);
    });

    it('should call addEmployee when form is valid', () => {
      const newEmployee = {
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      };

      employeeService.addEmployee.and.returnValue(of(mockEmployee));
      component.employeeForm.patchValue(newEmployee);

      component.onSubmit();

      expect(employeeService.addEmployee).toHaveBeenCalledWith(newEmployee);
    });

    it('should navigate to employees list after successful add', () => {
      employeeService.addEmployee.and.returnValue(of(mockEmployee));
      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      });

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('should set isSubmitting flag during submission', () => {
      employeeService.addEmployee.and.returnValue(of(mockEmployee));
      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      });

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should not submit when already submitting', () => {
      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      });
      component.isSubmitting = true;

      component.onSubmit();

      expect(employeeService.addEmployee).not.toHaveBeenCalled();
    });

    it('should handle error when add fails', () => {
      spyOn(window, 'alert');
      employeeService.addEmployee.and.returnValue(throwError(() => new Error('Add failed')));
      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      });

      component.onSubmit();

      expect(window.alert).toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('Cancel functionality', () => {
    beforeEach(() => {
      routeId = null;
      fixture = TestBed.createComponent(AddEditEmployee);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate to employees list when cancelled', () => {
      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/employees']);
    });
  });
});
