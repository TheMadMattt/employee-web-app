import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable, of, throwError} from 'rxjs';
import {Employee, EmployeeFormData, Gender} from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    {
      id: 1,
      registrationNumber: '00000001',
      firstName: 'Jan',
      lastName: 'Kowalski',
      gender: Gender.MALE
    },
    {
      id: 2,
      registrationNumber: '00000002',
      firstName: 'Anna',
      lastName: 'Nowak',
      gender: Gender.FEMALE
    },
    {
      id: 3,
      registrationNumber: '00000003',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      gender: Gender.MALE
    },
    {
      id: 4,
      registrationNumber: '00000004',
      firstName: 'Maria',
      lastName: 'Zielińska',
      gender: Gender.FEMALE
    },
    {
      id: 5,
      registrationNumber: '00000005',
      firstName: 'Alex',
      lastName: 'Smith',
      gender: Gender.MALE
    },
  ];

  private employeesSubject = new BehaviorSubject<Employee[]>(this.employees);
  private nextId = 6;

  constructor() {}

  getEmployees(): Observable<Employee[]> {
    return this.employeesSubject.asObservable();
  }

  getEmployeeById(id: number): Observable<Employee | undefined> {
    return this.employeesSubject.pipe(
      map(employees => employees.find(emp => emp.id === id))
    );
  }

  addEmployee(employeeData: EmployeeFormData): Observable<Employee> {
    if (!employeeData.firstName?.trim() || !employeeData.lastName?.trim()) {
      return throwError(() => new Error('First name and last name are required'));
    }

    const newEmployee: Employee = {
      id: this.nextId++,
      registrationNumber: this.generateRegistrationNumber(),
      firstName: employeeData.firstName.trim(),
      lastName: employeeData.lastName.trim(),
      gender: employeeData.gender
    };

    this.employees = [...this.employees, newEmployee];
    this.employeesSubject.next(this.employees);

    return of(newEmployee);
  }

  updateEmployee(id: number, employeeData: EmployeeFormData): Observable<Employee | null> {
    if (!employeeData.firstName?.trim() || !employeeData.lastName?.trim()) {
      return throwError(() => new Error('First name and last name are required'));
    }

    const index = this.employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return throwError(() => new Error(`Employee with id ${id} not found`));
    }

    const updatedEmployee: Employee = {
      ...this.employees[index],
      firstName: employeeData.firstName.trim(),
      lastName: employeeData.lastName.trim(),
      gender: employeeData.gender
    };

    this.employees = [
      ...this.employees.slice(0, index),
      updatedEmployee,
      ...this.employees.slice(index + 1)
    ];

    this.employeesSubject.next(this.employees);

    return of(updatedEmployee);
  }

  deleteEmployee(id: number): Observable<boolean> {
    const index = this.employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return of(false);
    }

    this.employees = [
      ...this.employees.slice(0, index),
      ...this.employees.slice(index + 1)
    ];

    this.employeesSubject.next(this.employees);

    return of(true);
  }

  private generateRegistrationNumber(): string {
    const currentMax = this.employees.reduce((max, emp) => {
      const num = parseInt(emp.registrationNumber, 10);
      return num > max ? num : max;
    }, 0);

    const nextNumber = currentMax + 1;
    return nextNumber.toString().padStart(8, '0');
  }
}
