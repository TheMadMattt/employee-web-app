import {AfterViewInit, ChangeDetectorRef, Component, computed, effect, forwardRef, Injector, Input, signal} from '@angular/core';
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

  constructor(private injector: Injector, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (ngControl) {
      this.control = ngControl.control as FormControl;
      this.cdr.detectChanges();
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
}
