import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {EmployeeService} from '../../services/employee.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Gender, GENDER_LABELS} from '../../../../shared/models/employee';
import {TextInput} from '../../../../shared/inputs/text-input/text-input';
import {translations} from '../../../../shared/common/translations';
import {NotificationService} from '../../../../shared/services/notification';

@Component({
  selector: 'app-add-edit-employee',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextInput
  ],
  templateUrl: './add-edit-employee.html',
  styleUrl: './add-edit-employee.scss'
})
export class AddEditEmployee  implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  employeeId?: number;
  isSubmitting = false;
  t = translations;

  readonly genderOptions = [
    { value: Gender.MALE, label: GENDER_LABELS[Gender.MALE] },
    { value: Gender.FEMALE, label: GENDER_LABELS[Gender.FEMALE] }
  ];

  min = 1;
  max = 50;

  title = computed(() => {
    return this.isEditMode() ? this.t['EDIT_EMPLOYEE'] : this.t['ADD_NEW_EMPLOYEE'];
  });

  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);

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

  private initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(this.min),
        Validators.maxLength(this.max)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(this.min),
        Validators.maxLength(this.max)
      ]],
      gender: [Gender.MALE]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
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
          this.notificationService.error(this.t['EMPLOYEE_NOT_FOUND']);
          this.router.navigate(['/employees']);
        }
      });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || this.isSubmitting) {
      this.employeeForm.markAllAsDirty();
      return;
    }

    this.isSubmitting = true;
    const formData = this.employeeForm.value;

    if (this.isEditMode() && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (employee) => {
            if (employee) {
              this.notificationService.success('Pomyślnie zaktualizowano pracownika');
              this.router.navigate(['/employees']);
            } else {
              this.notificationService.error(this.t['ERROR_UPDATING_EMPLOYEE']);
              this.isSubmitting = false;
            }
          },
          error: () => {
            this.notificationService.error(this.t['ERROR_UPDATING_EMPLOYEE']);
            this.isSubmitting = false;
          }
        });
    } else {
      this.employeeService.addEmployee(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.notificationService.success('Pomyślnie dodano pracownika');
            this.router.navigate(['/employees']);
          },
          error: () => {
            this.notificationService.error(this.t['ERROR_ADDING_EMPLOYEE']);
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}
