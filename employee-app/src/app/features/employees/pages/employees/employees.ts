import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Employee, GENDER_LABELS} from '../../models/employee';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {EmployeeService} from '../../services/employee.service';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {translations} from '../../../../shared/common/translations';

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
  sortField: SortField = 'registrationNumber';
  sortDirection: SortDirection = 'asc';
  t = translations;

  readonly genderLabels = GENDER_LABELS;
  private destroyRef = inject(DestroyRef);

  constructor(private employeeService: EmployeeService) {
  }

  ngOnInit(): void {
    this.employeeService.getEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(employees => {
        this.employees = employees;
        this.applyFiltersAndSort();
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
        .subscribe();
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
