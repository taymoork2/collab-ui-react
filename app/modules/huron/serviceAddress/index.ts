import { isolateForm, HRServiceAddressComponent } from './serviceAddress.component';

angular.module('Core')
  .directive('isolateForm', isolateForm)
  .component('hrServiceAddress', new HRServiceAddressComponent());
