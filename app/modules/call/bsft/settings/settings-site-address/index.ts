import { BsftSiteAddressComponent } from './settings-site-address.component';

export default angular.module('call.bsft.settings.address', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteAddress', new BsftSiteAddressComponent())
  .name;
