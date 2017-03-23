import { isolateForm, HRServiceAddressComponent } from './serviceAddress.component';

export default angular.module('huron.service-address', [])
  .directive('isolateForm', isolateForm)
  .component('hrServiceAddress', new HRServiceAddressComponent())
  .name;
