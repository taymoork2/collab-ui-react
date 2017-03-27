import { HuronSettingsComponent } from './settings.component';
import { HuronSettingsService } from './settings.service';
import { HuronSettingsOptionsService } from './settingsOptions.service';
import preferredLanguageModule from 'modules/huron/settings/preferredLanguage';
import extensionRangeModule from 'modules/huron/settings/extensionRange';
import extensionLengthModule from 'modules/huron/settings/extensionLength';
import routingPrefixModule from 'modules/huron/settings/routingPrefix';
import timeZoneModule from 'modules/huron/settings/timeZone';
import outboundDialDigitModule from 'modules/huron/settings/outboundDialDigit';
import companyVoicemailModule from 'modules/huron/settings/companyVoicemail';
import dialingModule from 'modules/huron/settings/dialing';
import timeFormatModule from 'modules/huron/settings/timeFormat';
import dateFormatModule from 'modules/huron/settings/dateFormat';
import defaultCountryModule from 'modules/huron/settings/defaultCountry';
import cosRestrictionModule from 'modules/huron/settings/cos';
import companyCallerIdModule from 'modules/huron/settings/companyCallerId';
import emergencyServiceNumberModule from 'modules/huron/settings/emergencyServiceNumber';
import emergencyServiceAddressModule from 'modules/huron/settings/emergencyServiceAddress';

export * from './settings.service';
export * from './settingsOptions.service';

export const E911_ADDRESS_PENDING: string = 'PENDING';

export default angular
  .module('huron.settings', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    preferredLanguageModule,
    extensionRangeModule,
    extensionLengthModule,
    routingPrefixModule,
    timeZoneModule,
    outboundDialDigitModule,
    companyVoicemailModule,
    dialingModule,
    timeFormatModule,
    dateFormatModule,
    defaultCountryModule,
    cosRestrictionModule,
    companyCallerIdModule,
    emergencyServiceNumberModule,
    emergencyServiceAddressModule,
  ])
  .component('ucSettings', new HuronSettingsComponent())
  .service('HuronSettingsService', HuronSettingsService)
  .service('HuronSettingsOptionsService', HuronSettingsOptionsService)
  .name;
