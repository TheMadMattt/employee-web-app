import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextInput } from './text-input';

@Component({
  template: `
    <form [formGroup]="form">
      <app-text-input
        [id]="'test-input'"
        [label]="'Test Label'"
        [placeholder]="'Enter text'"
        [required]="true"
        [maxLength]="50"
        formControlName="testField">
      </app-text-input>
    </form>
  `,
  imports: [TextInput, ReactiveFormsModule]
})
class TestHostComponent {
  form = new FormGroup({
    testField: new FormControl('')
  });
}

describe('TextInput', () => {
  let component: TextInput;
  let fixture: ComponentFixture<TextInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInput, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextInput);
    component = fixture.componentInstance;
    component.id = 'test';
    component.label = 'Test Label';
    // Don't call detectChanges() yet as component needs FormControl
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor implementation', () => {
    it('should write value', () => {
      component.writeValue('test value');

      expect(component.value).toBe('test value');
    });

    it('should handle null value in writeValue', () => {
      component.writeValue(null);

      expect(component.value).toBe('');
    });

    it('should handle undefined value in writeValue', () => {
      component.writeValue(undefined);

      expect(component.value).toBe('');
    });

    it('should register onChange callback', () => {
      const onChange = jasmine.createSpy('onChange');
      component.registerOnChange(onChange);

      expect(component.onChange).toBe(onChange);
    });

    it('should register onTouched callback', () => {
      const onTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouched);

      expect(component.onTouched).toBe(onTouched);
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);

      expect(component.disabled).toBe(true);
    });

    it('should enable when disabled state is false', () => {
      component.disabled = true;
      component.setDisabledState(false);

      expect(component.disabled).toBe(false);
    });
  });

  describe('Input change handling', () => {
    it('should update value on input change', () => {
      const mockEvent = {
        target: { value: 'new value' }
      } as any;

      component.onInputChange(mockEvent);

      expect(component.value).toBe('new value');
    });

    it('should call onChange callback on input change', () => {
      const onChange = jasmine.createSpy('onChange');
      component.registerOnChange(onChange);

      const mockEvent = {
        target: { value: 'test' }
      } as any;

      component.onInputChange(mockEvent);

      expect(onChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Blur handling', () => {
    it('should set touched to true on blur', () => {
      expect(component.touched).toBe(false);

      component.onBlur();

      expect(component.touched).toBe(true);
    });

    it('should call onTouched callback on blur', () => {
      const onTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouched);

      component.onBlur();

      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('Input properties', () => {
    it('should accept id input', () => {
      component.id = 'custom-id';

      expect(component.id).toBe('custom-id');
    });

    it('should accept label input', () => {
      component.label = 'Custom Label';

      expect(component.label).toBe('Custom Label');
    });

    it('should accept placeholder input', () => {
      component.placeholder = 'Enter something';

      expect(component.placeholder).toBe('Enter something');
    });

    it('should have default empty placeholder', () => {
      const newFixture = TestBed.createComponent(TextInput);
      const newComponent = newFixture.componentInstance;
      // Don't call detectChanges() as it would throw without FormControl

      expect(newComponent.placeholder).toBe('');
    });

    it('should accept required input', () => {
      component.required = true;

      expect(component.required).toBe(true);
    });

    it('should have default required as false', () => {
      const newFixture = TestBed.createComponent(TextInput);
      const newComponent = newFixture.componentInstance;
      // Don't call detectChanges() as it would throw without FormControl

      expect(newComponent.required).toBe(false);
    });

    it('should accept maxLength input', () => {
      component.maxLength = 100;

      expect(component.maxLength).toBe(100);
    });
  });
});

describe('TextInput with FormControl integration', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update FormControl when input changes', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test value';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.form.get('testField')?.value).toBe('test value');
  });

  it('should update input when FormControl value changes', () => {
    hostComponent.form.get('testField')?.setValue('form value');
    fixture.detectChanges();

    const textInputComponent = fixture.debugElement.children[0].children[0].componentInstance;
    expect(textInputComponent.value).toBe('form value');
  });

  it('should mark as touched on blur', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));

    expect(hostComponent.form.get('testField')?.touched).toBe(true);
  });
});
