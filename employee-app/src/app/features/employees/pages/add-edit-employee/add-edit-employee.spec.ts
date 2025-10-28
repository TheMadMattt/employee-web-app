import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEmployee } from './add-edit-employee';

describe('AddEditEmployee', () => {
  let component: AddEditEmployee;
  let fixture: ComponentFixture<AddEditEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditEmployee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditEmployee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
