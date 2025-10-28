import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Employees } from './employees';
import { EmployeeService } from '../../services/employee.service';
import { of, throwError } from 'rxjs';
import { Gender } from '../../models/employee';
import { provideRouter } from '@angular/router';

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  const mockEmployees = [
    { id: 1, registrationNumber: '00000001', firstName: 'Jan', lastName: 'Kowalski', gender: Gender.MALE },
    { id: 2, registrationNumber: '00000002', firstName: 'Anna', lastName: 'Nowak', gender: Gender.FEMALE },
    { id: 3, registrationNumber: '00000003', firstName: 'Piotr', lastName: 'Wiśniewski', gender: Gender.MALE }
  ];

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'deleteEmployee']);

    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        provideRouter([])
      ]
    })
    .compileComponents();

    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load employees on init', fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));

      fixture.detectChanges();
      tick(1000);

      expect(component.employees.length).toBe(3);
      expect(component.filteredEmployees().length).toBe(3);
      expect(component.isLoading()).toBe(false);
    }));

    it('should set loading state during employee fetch', () => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));

      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
    });

    it('should handle error when loading employees fails', fakeAsync(() => {
      const error = new Error('Failed to load');
      employeeService.getEmployees.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      tick(1000);

      expect(component.errorMessage()).toBe('Failed to load');
    }));
  });

  describe('search functionality', () => {
    beforeEach(fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));
      fixture.detectChanges();
      tick(1000);
    }));

    it('should filter employees by first name', () => {
      component.searchTerm = 'Jan';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].firstName).toBe('Jan');
    });

    it('should filter employees by last name', () => {
      component.searchTerm = 'Nowak';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].lastName).toBe('Nowak');
    });

    it('should be case insensitive', () => {
      component.searchTerm = 'anna';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].firstName).toBe('Anna');
    });

    it('should return all employees when search term is empty', () => {
      component.searchTerm = '';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(3);
    });

    it('should return no employees when search term does not match', () => {
      component.searchTerm = 'NonExistent';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(0);
    });

    it('should trim search term', () => {
      component.searchTerm = '  Jan  ';
      component.onSearchChange();

      expect(component.filteredEmployees().length).toBe(1);
    });
  });

  describe('sorting functionality', () => {
    beforeEach(fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));
      fixture.detectChanges();
      tick(1000);
    }));

    it('should sort by first name ascending', () => {
      component.onSort('firstName');

      expect(component.sortField()).toBe('firstName');
      expect(component.sortDirection()).toBe('asc');
      expect(component.filteredEmployees()[0].firstName).toBe('Anna');
      expect(component.filteredEmployees()[2].firstName).toBe('Piotr');
    });

    it('should sort by first name descending when clicked twice', () => {
      component.onSort('firstName');
      component.onSort('firstName');

      expect(component.sortDirection()).toBe('desc');
      expect(component.filteredEmployees()[0].firstName).toBe('Piotr');
      expect(component.filteredEmployees()[2].firstName).toBe('Anna');
    });

    it('should sort by last name', () => {
      component.onSort('lastName');

      expect(component.sortField()).toBe('lastName');
      expect(component.filteredEmployees()[0].lastName).toBe('Kowalski');
    });

    it('should sort by gender', () => {
      component.onSort('gender');

      expect(component.sortField()).toBe('gender');
      expect(component.filteredEmployees()[0].gender).toBe(Gender.FEMALE);
    });

    it('should reset to ascending when changing sort field', () => {
      component.onSort('firstName');
      component.onSort('firstName');
      expect(component.sortDirection()).toBe('desc');

      component.onSort('lastName');
      expect(component.sortDirection()).toBe('asc');
    });
  });

  describe('sort icons', () => {
    beforeEach(fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));
      fixture.detectChanges();
      tick(1000);
    }));

    it('should show up arrow for ascending sort on active field', () => {
      component.onSort('firstName');

      expect(component.sortIconFirstName()).toBe('↑');
    });

    it('should show down arrow for descending sort on active field', () => {
      component.onSort('firstName');
      component.onSort('firstName');

      expect(component.sortIconFirstName()).toBe('↓');
    });

    it('should show both arrows for inactive fields', () => {
      component.onSort('firstName');

      expect(component.sortIconLastName()).toBe('↕');
      expect(component.sortIconGender()).toBe('↕');
    });
  });

  describe('delete functionality', () => {
    beforeEach(fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));
      fixture.detectChanges();
      tick(1000);
    }));

    it('should call deleteEmployee when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      employeeService.deleteEmployee.and.returnValue(of(true));

      component.onDelete(mockEmployees[0]);

      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);
    });

    it('should not call deleteEmployee when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onDelete(mockEmployees[0]);

      expect(employeeService.deleteEmployee).not.toHaveBeenCalled();
    });

    it('should set error message when delete fails', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      employeeService.deleteEmployee.and.returnValue(of(false));

      component.onDelete(mockEmployees[0]);
      tick();

      expect(component.errorMessage()).toBeTruthy();
    }));

    it('should handle error when delete throws', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      employeeService.deleteEmployee.and.returnValue(throwError(() => new Error('Delete failed')));

      component.onDelete(mockEmployees[0]);
      tick();

      expect(component.errorMessage()).toBe('Delete failed');
    }));
  });

  describe('employeesResultText', () => {
    beforeEach(fakeAsync(() => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));
      fixture.detectChanges();
      tick(1000);
    }));

    it('should show result count when employees are filtered', () => {
      const resultText = component.employeesResultText();

      expect(resultText).toContain('3');
    });

    it('should return empty string when no employees', () => {
      component.filteredEmployees.set([]);

      expect(component.employeesResultText()).toBe('');
    });
  });
});
