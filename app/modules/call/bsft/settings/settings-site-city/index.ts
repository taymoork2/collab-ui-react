import { BsftSiteCityComponent } from './settings-site-city.component';

export default angular.module('call.bsft.settings.city', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteCity', new BsftSiteCityComponent())
  .name;
