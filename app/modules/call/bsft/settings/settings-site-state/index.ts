import { BsftSiteStateComponent } from './settings-site-state.component';

export default angular.module('call.bsft.settings.state', [
  require('@collabui/collab-ui-ng').default,
])
  .component('bsftSiteState', new BsftSiteStateComponent())
  .name;
