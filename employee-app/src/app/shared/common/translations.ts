export interface Translations {
  [key: string]: string;
}

export const translations: Translations = {
  APP_TITLE: 'System Zarządzania Pracownikami',
  DELETE_EMPLOYEE_QUESTION: 'Czy na pewno chcesz usunąć pracownika ',
  EMPLOYEE_LIST: 'Lista Pracowników',
  ADD_EMPLOYEE: 'Dodaj pracownika',
  ADD_NEW_EMPLOYEE: 'Dodaj nowego pracownika',
  EDIT_EMPLOYEE: 'Edytuj pracownika',
  SEARCH_EMPLOYEE: 'Szukaj po imieniu lub nazwisku...',
  REGISTRATION_NUMBER: 'Numer ewidencyjny',
  NAME: 'Imię',
  LAST_NAME: 'Nazwisko',
  GENDER: 'Płeć',
  ACTIONS: 'Akcje',
  EDIT: 'Edytuj',
  REMOVE: 'Usuń',
  SEARCH_NOT_FOUND: 'Nie znaleziono pracowników spełniających kryteria wyszukiwania',
  NO_EMPLOYEES: 'Brak pracowników',
  EMPLOYEES_RESULT_TEXT: 'Wyświetlono {0} z {1} pracowników',
  BACK_TO_EMPLOYEES: 'Powrót do listy',
  NAME_INPUT: 'Wprowadź imię',
  LAST_NAME_INPUT: 'Wprowadź nazwisko',
  CANCEL: 'Anuluj',
  SAVING: 'Zapisywanie...',
  SAVE: 'Zapisz zmiany',
  MALE: 'Mężczyzna',
  FEMALE: 'Kobieta',
  ERROR_LOADING_EMPLOYEES: 'Wystąpił błąd podczas ładowania pracowników',
  ERROR_DELETING_EMPLOYEE: 'Wystąpił błąd podczas usuwania pracownika',
  ERROR_ADDING_EMPLOYEE: 'Wystąpił błąd podczas dodawania pracownika',
  ERROR_EDITING_EMPLOYEE: 'Wystąpił błąd podczas edytowania pracownika',
  EMPLOYEE_NOT_FOUND: 'Nie znaleziono pracownika o podanym numerze ewidencyjnym',
  REQUIRED_FIELD: 'To pole jest wymagane',
  MIN_LENGTH: 'Minimalna długość znaków to ',
  MAX_LENGTH: 'Maksymalna długość znaków to '
};
