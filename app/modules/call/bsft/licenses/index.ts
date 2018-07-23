import { LicenseAllocationComponent } from './license-allocation.component';
import LicenseInputModule from './license-input';

export default angular
  .module('call.bsft.licenseAllocation', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    LicenseInputModule,
  ])
  .component('bsftLicenseAllocation', new LicenseAllocationComponent())
  .name;
