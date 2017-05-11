import booleanTextFieldModuleName from '../boolean-text-field';
import { ToggleSwitchWithReadOnlyComponent } from './toggle-switch-with-read-only.component';

export default angular
  .module('shared.toggle-switch-with-read-only', [
    require('scripts/app.templates'),
    require('angular-translate'),
    booleanTextFieldModuleName,
  ])
  .component('toggleSwitchWithReadOnly', new ToggleSwitchWithReadOnlyComponent())
  .name;
