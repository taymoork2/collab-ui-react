import { BsftSettingsComponent } from './bsft-settings.component';
import bsftSharedModule from './shared';
import bsftSiteNameModule from './settings-site-name';

export default angular
  .module('call.bsft.settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    bsftSharedModule,
    bsftSiteNameModule,
  ])
  .component('bsftSettings', new BsftSettingsComponent())
  .name;
