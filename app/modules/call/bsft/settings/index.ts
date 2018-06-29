import { BsftSettingsComponent } from './bsft-settings.component';
import bsftSharedModule from './shared';
import bsftSiteNameModule from './settings-site-name';
import bsftContactFirstNameModule from './settings-contact-first-name';
import bsftContactLastNameModule from './settings-contact-last-name';
import bsftContactEmailModule from './settings-contact-email';

export default angular
  .module('call.bsft.settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    bsftSharedModule,
    bsftSiteNameModule,
    bsftContactFirstNameModule,
    bsftContactLastNameModule,
    bsftContactEmailModule,
  ])
  .component('bsftSettings', new BsftSettingsComponent())
  .name;
