import { isolateForm, HRServiceAddressComponent } from './serviceAddress.component';
import countryServiceModule from 'modules/huron/countries';

export default angular
  .module('huron.service-address', [
    countryServiceModule,
  ])
  .directive('isolateForm', isolateForm)
  .component('hrServiceAddress', new HRServiceAddressComponent())
  .name;
