import {translations} from '../common/translations';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface Employee {
  id: number;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  gender: Gender;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  gender: Gender;
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: translations['MALE'],
  [Gender.FEMALE]: translations['FEMALE']
};
