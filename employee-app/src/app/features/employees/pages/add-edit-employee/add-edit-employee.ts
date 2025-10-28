import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {EmployeeService} from '../../services/employee.service';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Gender, GENDER_LABELS} from '../../models/employee';
import {TextInput} from '../../../../shared/inputs/text-input/text-input';
import {translations} from '../../../../shared/common/translations';

@Component({
  selector: 'app-add-edit-employee',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextInput
  ],
  templateUrl: './add-edit-employee.html',
  styleUrl: './add-edit-employee.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditEmployee  implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  isSubmitting = false;
  t = translations;

  readonly genderOptions = [
    { value: Gender.MALE, label: GENDER_LABELS[Gender.MALE] },
    { value: Gender.FEMALE, label: GENDER_LABELS[Gender.FEMALE] }
  ];

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  get title(): string {
    return this.isEditMode ? this.t['EDIT_EMPLOYEE'] : this.t['ADD_NEW_EMPLOYEE'];
  }

  get f() {
    return this.employeeForm.controls;
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      gender: [Gender.MALE, Validators.required]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.employeeId = parseInt(id, 10);
      this.loadEmployee();
    }
  }

  private loadEmployee(): void {
    if (!this.employeeId) return;

    this.employeeService.getEmployeeById(this.employeeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(employee => {
        if (employee) {
          this.employeeForm.patchValue({
            firstName: employee.firstName,
            lastName: employee.lastName,
            gender: employee.gender
          });
        } else {
          alert(this.t['EMPLOYEE_NOT_FOUND']);
          this.router.navigate(['/employees']);
        }
      });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || this.isSubmitting) {
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (employee) => {
            if (employee) {
              this.router.navigate(['/employees']);
            } else {
              alert(this.t['ERROR_UPDATING_EMPLOYEE']);
              this.isSubmitting = false;
            }
          },
          error: () => {
            alert(this.t['ERROR_UPDATING_EMPLOYEE']);
            this.isSubmitting = false;
          }
        });
    } else {
      this.employeeService.addEmployee(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/employees']);
          },
          error: () => {
            alert(this.t['ERROR_ADDING_EMPLOYEE']);
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.employeeForm.get(fieldName);

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return this.t['REQUIRED_FIELD'];
    }

    if (control.errors['minlength']) {
      return this.t['MIN_LENGTH']+`${control.errors['minlength'].requiredLength}`;
    }

    if (control.errors['maxlength']) {
      return this.t['MAX_LENGTH']+`${control.errors['maxlength'].requiredLength}`;
    }

    return '';
  }
}
