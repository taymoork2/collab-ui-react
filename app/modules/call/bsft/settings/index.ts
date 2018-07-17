import './bsft-settings.scss';

import { BsftSettingsComponent } from './bsft-settings.component';
import bsftSettingsSharedModule from './shared';
import bsftSiteNameModule from './settings-site-name';
import bsftSiteAddress from './settings-site-address';
import bsftSiteCity from './settings-site-city';
import bsftSiteZipcode from './settings-site-zipcode';
import bsftSiteState from './settings-site-state';
import bsftSiteCountry from './settings-site-country';
import bsftContactFirstNameModule from './settings-contact-first-name';
import bsftContactLastNameModule from './settings-contact-last-name';
import bsftContactPhoneNumberModule from './settings-contact-phone-number';
import bsftContactEmailModule from './settings-contact-email';
import bsftSharedModule from 'modules/call/bsft/shared';
import * as config from 'modules/core/scripts/services/utils.js';

export default angular
  .module('call.bsft.settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    bsftSharedModule,
    bsftSettingsSharedModule,
    bsftSiteNameModule,
    bsftSiteAddress,
    bsftSiteCity,
    bsftSiteZipcode,
    bsftSiteState,
    bsftSiteCountry,
    bsftContactFirstNameModule,
    bsftContactLastNameModule,
    bsftContactPhoneNumberModule,
    bsftContactEmailModule,
    config,
  ])
  .component('bsftSettings', new BsftSettingsComponent())
  .name;
