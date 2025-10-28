import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Employee, GENDER_LABELS} from '../../models/employee';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {EmployeeService} from '../../services/employee.service';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {translations} from '../../../../shared/common/translations';
import {delay, finalize} from 'rxjs';

type SortField = 'registrationNumber' | 'firstName' | 'lastName' | 'gender';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employees',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  sortField: SortField = 'registrationNumber';
  sortDirection: SortDirection = 'asc';
  t = translations;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  readonly genderLabels = GENDER_LABELS;
  private destroyRef = inject(DestroyRef);

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
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onDelete(employee: Employee): void {
    if (confirm(this.t['DELETE_EMPLOYEE_QUESTION']+`${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (success) => {
            if (!success) {
              this.errorMessage.set(this.t['ERROR_DELETING_EMPLOYEE']);
            }
          },
          error: (error) => {
            this.errorMessage.set(error.message || this.t['ERROR_DELETING_EMPLOYEE']);
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

      switch (this.sortField) {
        case 'registrationNumber':
          compareValue = a.registrationNumber.localeCompare(b.registrationNumber);
          break;
        case 'firstName':
          compareValue = a.firstName.localeCompare(b.firstName);
          break;
        case 'lastName':
          compareValue = a.lastName.localeCompare(b.lastName);
          break;
        case 'gender':
          compareValue = a.gender.localeCompare(b.gender);
          break;
      }

      return this.sortDirection === 'asc' ? compareValue : -compareValue;
    });

    this.filteredEmployees.set(result);
  }
}
