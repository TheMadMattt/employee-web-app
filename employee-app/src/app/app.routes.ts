import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadComponent: () => import('./features/employees/pages/employees/employees')
      .then(m => m.Employees)
  },
  {
    path: 'employees/add',
    loadComponent: () => import('./features/employees/pages/add-edit-employee/add-edit-employee')
      .then(m => m.AddEditEmployee)
  },
  {
    path: 'employees/edit/:id',
    loadComponent: () => import('./features/employees/pages/add-edit-employee/add-edit-employee')
      .then(m => m.AddEditEmployee)
  }
];
