import './license-input.scss';

import { LicenseInputComponent } from './license-input.component';

export default angular
  .module('call.bsft.licenseAllocation.input', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('licenseInput', new LicenseInputComponent())
  .name;
