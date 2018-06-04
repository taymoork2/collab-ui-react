import { BsftSiteNameComponent } from './settings-site-name.component';

export default angular.module('call.bsft.settings.name', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteName', new BsftSiteNameComponent())
  .name;
