import { PrivateTrunkAddressesStatusComponent } from './private-trunk-addresses-status.component';

require('./_private-trunk-addresses-status.scss');

export default angular
  .module('Hercules')
  .component('privateTrunkAddressesStatus', new PrivateTrunkAddressesStatusComponent())
  .name;
