import { ThreeDotDropdownComponent } from './three-dot-dropdown.component';

export default angular
  .module('core.accessibility.dropdown', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('threeDotDropdown', new ThreeDotDropdownComponent())
  .name;
