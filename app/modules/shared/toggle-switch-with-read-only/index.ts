import booleanTextFieldModuleName from '../boolean-text-field';
import toggleSwitchModuleName from '@collabui/collab-ui-ng/bundles/components/toggleswitch';
import { ToggleSwitchWithReadOnlyComponent } from './toggle-switch-with-read-only.component';

export default angular
  .module('shared.toggle-switch-with-read-only', [
    require('angular-translate'),
    booleanTextFieldModuleName,
    toggleSwitchModuleName,
  ])
  .component('toggleSwitchWithReadOnly', new ToggleSwitchWithReadOnlyComponent())
  .name;
