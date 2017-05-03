import { BooleanTextFieldComponent } from './boolean-text-field.component';

export default angular
  .module('messenger.shared', [
    require('scripts/app.templates'),
    require('angular-translate'),
  ])
  .component('booleanTextField', new BooleanTextFieldComponent())
  .name;
