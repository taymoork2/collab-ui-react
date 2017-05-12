import { BooleanTextFieldComponent } from './boolean-text-field.component';

export default angular
  .module('shared.boolean-text-field', [
    require('scripts/app.templates'),
    require('angular-translate'),
  ])
  .component('booleanTextField', new BooleanTextFieldComponent())
  .name;
