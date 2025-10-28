export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
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
  [Gender.MALE]: 'Mężczyzna',
  [Gender.FEMALE]: 'Kobieta',
  [Gender.OTHER]: 'Inne'
};
