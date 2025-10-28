import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';
import { Gender } from '../models/employee';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEmployees', () => {
    it('should return observable with initial employees', (done) => {
      service.getEmployees().subscribe(employees => {
        expect(employees).toBeDefined();
        expect(employees.length).toBe(5);
        expect(employees[0].firstName).toBe('Jan');
        done();
      });
    });

    it('should return employees as observable that updates on changes', (done) => {
      let callCount = 0;

      service.getEmployees().subscribe(employees => {
        callCount++;

        if (callCount === 1) {
          expect(employees.length).toBe(5);
        } else if (callCount === 2) {
          expect(employees.length).toBe(6);
          expect(employees[5].firstName).toBe('Test');
          done();
        }
      });

      service.addEmployee({
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      }).subscribe();
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee when found', (done) => {
      service.getEmployeeById(1).subscribe(employee => {
        expect(employee).toBeDefined();
        expect(employee?.firstName).toBe('Jan');
        expect(employee?.lastName).toBe('Kowalski');
        expect(employee?.id).toBe(1);
        done();
      });
    });

    it('should return undefined when employee not found', (done) => {
      service.getEmployeeById(999).subscribe(employee => {
        expect(employee).toBeUndefined();
        done();
      });
    });

    it('should reflect updates after employee is modified', (done) => {
      service.updateEmployee(1, {
        firstName: 'Updated',
        lastName: 'Name',
        gender: Gender.MALE
      }).subscribe(() => {
        service.getEmployeeById(1).subscribe(employee => {
          expect(employee?.firstName).toBe('Updated');
          expect(employee?.lastName).toBe('Name');
          done();
        });
      });
    });
  });

  describe('addEmployee', () => {
    it('should add new employee with incremented id', (done) => {
      const newEmployee = {
        firstName: 'New',
        lastName: 'Employee',
        gender: Gender.FEMALE
      };

      service.addEmployee(newEmployee).subscribe(employee => {
        expect(employee).toBeDefined();
        expect(employee.id).toBe(6);
        expect(employee.firstName).toBe('New');
        expect(employee.lastName).toBe('Employee');
        expect(employee.gender).toBe(Gender.FEMALE);
        expect(employee.registrationNumber).toBe('00000006');
        done();
      });
    });

    it('should generate correct registration number', (done) => {
      service.addEmployee({
        firstName: 'First',
        lastName: 'User',
        gender: Gender.MALE
      }).subscribe(employee => {
        expect(employee.registrationNumber).toBe('00000006');

        service.addEmployee({
          firstName: 'Second',
          lastName: 'User',
          gender: Gender.MALE
        }).subscribe(employee2 => {
          expect(employee2.registrationNumber).toBe('00000007');
          done();
        });
      });
    });

    it('should trim whitespace from names', (done) => {
      service.addEmployee({
        firstName: '  Trimmed  ',
        lastName: '  Name  ',
        gender: Gender.MALE
      }).subscribe(employee => {
        expect(employee.firstName).toBe('Trimmed');
        expect(employee.lastName).toBe('Name');
        done();
      });
    });

    it('should throw error when firstName is empty', (done) => {
      service.addEmployee({
        firstName: '',
        lastName: 'Test',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('First name and last name are required');
          done();
        }
      });
    });

    it('should throw error when lastName is empty', (done) => {
      service.addEmployee({
        firstName: 'Test',
        lastName: '',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('First name and last name are required');
          done();
        }
      });
    });

    it('should throw error when firstName is only whitespace', (done) => {
      service.addEmployee({
        firstName: '   ',
        lastName: 'Test',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('First name and last name are required');
          done();
        }
      });
    });
  });

  describe('updateEmployee', () => {
    it('should update existing employee', (done) => {
      service.updateEmployee(1, {
        firstName: 'Updated',
        lastName: 'Employee',
        gender: Gender.FEMALE
      }).subscribe(employee => {
        expect(employee).toBeDefined();
        expect(employee?.firstName).toBe('Updated');
        expect(employee?.lastName).toBe('Employee');
        expect(employee?.gender).toBe(Gender.FEMALE);
        expect(employee?.id).toBe(1);
        expect(employee?.registrationNumber).toBe('00000001');
        done();
      });
    });

    it('should trim whitespace from names', (done) => {
      service.updateEmployee(1, {
        firstName: '  Trimmed  ',
        lastName: '  Updated  ',
        gender: Gender.MALE
      }).subscribe(employee => {
        expect(employee?.firstName).toBe('Trimmed');
        expect(employee?.lastName).toBe('Updated');
        done();
      });
    });

    it('should preserve registration number when updating', (done) => {
      const originalRegNumber = '00000001';

      service.updateEmployee(1, {
        firstName: 'Changed',
        lastName: 'Name',
        gender: Gender.MALE
      }).subscribe(employee => {
        expect(employee?.registrationNumber).toBe(originalRegNumber);
        done();
      });
    });

    it('should throw error when employee not found', (done) => {
      service.updateEmployee(999, {
        firstName: 'Test',
        lastName: 'User',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('Employee with id 999 not found');
          done();
        }
      });
    });

    it('should throw error when firstName is empty', (done) => {
      service.updateEmployee(1, {
        firstName: '',
        lastName: 'Test',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('First name and last name are required');
          done();
        }
      });
    });

    it('should throw error when lastName is empty', (done) => {
      service.updateEmployee(1, {
        firstName: 'Test',
        lastName: '',
        gender: Gender.MALE
      }).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('First name and last name are required');
          done();
        }
      });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete existing employee and return true', (done) => {
      service.deleteEmployee(1).subscribe(success => {
        expect(success).toBe(true);

        service.getEmployees().subscribe(employees => {
          expect(employees.length).toBe(4);
          expect(employees.find(emp => emp.id === 1)).toBeUndefined();
          done();
        });
      });
    });

    it('should return false when employee not found', (done) => {
      service.deleteEmployee(999).subscribe(success => {
        expect(success).toBe(false);
        done();
      });
    });

    it('should not modify employees array when deleting non-existent employee', (done) => {
      service.getEmployees().subscribe(employeesBefore => {
        const countBefore = employeesBefore.length;

        service.deleteEmployee(999).subscribe(() => {
          service.getEmployees().subscribe(employeesAfter => {
            expect(employeesAfter.length).toBe(countBefore);
            done();
          });
        });
      });
    });

    it('should allow deleting multiple employees sequentially', (done) => {
      service.deleteEmployee(1).subscribe(() => {
        service.deleteEmployee(2).subscribe(() => {
          service.getEmployees().subscribe(employees => {
            expect(employees.length).toBe(3);
            expect(employees.find(emp => emp.id === 1)).toBeUndefined();
            expect(employees.find(emp => emp.id === 2)).toBeUndefined();
            done();
          });
        });
      });
    });
  });
});
