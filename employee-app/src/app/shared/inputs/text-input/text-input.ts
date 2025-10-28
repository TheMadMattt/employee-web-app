import {AfterViewInit, Component, forwardRef, Injector, Input} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {max} from 'rxjs';
import {translations} from '../../common/translations';

@Component({
  selector: 'app-text-input',
  imports: [],
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true
    }
  ]
})
export class TextInput implements AfterViewInit, ControlValueAccessor {
  @Input() id!: string;
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() maxLength?: number

  t = translations;

  control?: FormControl;

  value = '';
  disabled = false;
  touched = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private injector: Injector) { }

  ngAfterViewInit(): void {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (ngControl) {
      this.control = ngControl.control as FormControl;
    } else {
      console.error('Missing control');
    }
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  get hasError(): boolean {
    return this.control ? (this.control.touched && this.control.invalid) : false;
  }

  get errorMessage(): string {
    if (!this.control || !this.control.touched || !this.control.errors) {
      return '';
    }

    if (this.control.errors['required']) {
      return this.t['REQUIRED_FIELD'];
    }

    if (this.control.errors['minlength']) {
      const minLength = this.control.errors['minlength'].requiredLength;
      return this.t['MIN_LENGTH']+`${minLength}`;
    }

    if (this.control.errors['maxlength']) {
      const maxLength = this.control.errors['maxlength'].requiredLength;
      return this.t['MAX_LENGTH']+`${maxLength}`;
    }

    return '';
  }
}
