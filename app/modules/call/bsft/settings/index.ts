import { BsftSettingsComponent } from './bsft-settings.component';
import bsftSettingsSharedModule from './shared';
import bsftSiteNameModule from './settings-site-name';
import bsftSiteAddress from './settings-site-address';
import bsftSiteCity from './settings-site-city';
import bsftSiteState from './settings-site-state';
import bsftSiteCountry from './settings-site-country';
import bsftContactFirstNameModule from './settings-contact-first-name';
import bsftContactLastNameModule from './settings-contact-last-name';
import bsftContactPhoneNumberModule from './settings-contact-phone-number';
import bsftContactEmailModule from './settings-contact-email';
import bsftSharedModule from 'modules/call/bsft/shared';

export default angular
  .module('call.bsft.settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    bsftSharedModule,
    bsftSettingsSharedModule,
    bsftSiteNameModule,
    bsftSiteAddress,
    bsftSiteCity,
    bsftSiteState,
    bsftSiteCountry,
    bsftContactFirstNameModule,
    bsftContactLastNameModule,
    bsftContactPhoneNumberModule,
    bsftContactEmailModule,
  ])
  .component('bsftSettings', new BsftSettingsComponent())
  .name;
