import booleanTextFieldModuleName from './boolean-text-field';
import toggleSwitchWithReadOnlyModuleName from './toggle-switch-with-read-only';

export default angular
  .module('shared', [
    require('scripts/app.templates'),
    require('angular-translate'),
    booleanTextFieldModuleName,
    toggleSwitchWithReadOnlyModuleName,
  ])
  .name;
