import { SiteAssignNumberComponent } from './site-assign-number.component';

export default angular.module('call.bsft.numbers.sitenumber', [
  require('@collabui/collab-ui-ng').default,
])
  .component('siteAssignNumber', new SiteAssignNumberComponent())
  .name;
