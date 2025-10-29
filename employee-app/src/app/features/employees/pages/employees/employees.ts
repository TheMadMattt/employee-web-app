import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Employee, GENDER_LABELS} from '../../../../shared/models/employee';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {EmployeeService} from '../../services/employee.service';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {translations} from '../../../../shared/common/translations';
import {delay} from 'rxjs';
import {NotificationService} from '../../../../shared/services/notification';

type SortField = 'registrationNumber' | 'firstName' | 'lastName' | 'gender';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employees',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class Employees implements OnInit {
  employees: Employee[] = [];
  filteredEmployees = signal<Employee[]>([]);
  employeesResultText = computed(() => {
    if (this.filteredEmployees().length > 0) {
      let translation = this.t['EMPLOYEES_RESULT_TEXT'];
      translation = translation.replace('{0}', this.filteredEmployees().length.toString())
        .replace('{1}', this.employees.length.toString());

      return translation;
    }
    return '';
  })
  searchTerm = '';
  sortField = signal<SortField>('registrationNumber');
  sortDirection = signal<SortDirection>('asc');

  sortIconRegistrationNumber = computed(() => this.getSortIconValue('registrationNumber'));
  sortIconFirstName = computed(() => this.getSortIconValue('firstName'));
  sortIconLastName = computed(() => this.getSortIconValue('lastName'));
  sortIconGender = computed(() => this.getSortIconValue('gender'));

  t = translations;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  readonly genderLabels = GENDER_LABELS;
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);

  constructor(private employeeService: EmployeeService) {
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.employeeService.getEmployees()
      .pipe(
        delay(1000),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.applyFiltersAndSort();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error.message || this.t['ERROR_LOADING_EMPLOYEES']);
        }
      });
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  onSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.applyFiltersAndSort();
  }

  private getSortIconValue(field: SortField): string {
    if (this.sortField() !== field) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  onDelete(employee: Employee): void {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const message = this.t['DELETE_EMPLOYEE_QUESTION'].replace('{0}', employeeName);
    if (this.notificationService.confirm(message)) {
      this.employeeService.deleteEmployee(employee.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (success) => {
            if (success) {
              this.notificationService.success(this.t['SUCCESS_DELETING_EMPLOYEE']);
            } else {
              this.notificationService.error(this.t['ERROR_DELETING_EMPLOYEE']);
            }
          },
          error: (error) => {
            this.notificationService.error(error.message || this.t['ERROR_DELETING_EMPLOYEE']);
          }
        });
    }
  }

  private applyFiltersAndSort(): void {
    let result = [...this.employees];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let compareValue = 0;

      switch (this.sortField()) {
        case 'registrationNumber':
          compareValue = a.registrationNumber.localeCompare(b.registrationNumber);
          break;
        case 'firstName':
          compareValue = a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase(), 'pl');
          break;
        case 'lastName':
          compareValue = a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase(), 'pl');
          break;
        case 'gender':
          compareValue = a.gender.localeCompare(b.gender);
          break;
      }

      return this.sortDirection() === 'asc' ? compareValue : -compareValue;
    });

    this.filteredEmployees.set(result);
  }
}
