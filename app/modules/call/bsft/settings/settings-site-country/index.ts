import { BsftSiteCountryComponent } from './settings-site-country.component';

export default angular.module('call.bsft.settings.country', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteCountry', new BsftSiteCountryComponent())
  .name;
