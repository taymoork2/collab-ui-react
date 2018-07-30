import { BsftSiteZipcodeComponent } from './settings-site-zipcode.component';

export default angular.module('call.bsft.settings.zipcode', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteZipcode', new BsftSiteZipcodeComponent())
  .name;
