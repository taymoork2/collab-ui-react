import { HuronSettingsComponent } from './settings.component';
import { HuronSettingsService } from './settings.service';
import { HuronSettingsOptionsService } from './settingsOptions.service';
import numberServiceModule from 'modules/huron/numbers';
import dialPlanServiceModule from 'modules/huron/dialPlans';
import siteServiceModule from 'modules/huron/sites';
import modalServiceModule from 'modules/core/modal';
import customerServiceModule from 'modules/huron/customer';
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
import externalTransferModule from 'modules/huron/settings/externalCallTransfer';

export * from './settings.service';
export * from './settingsOptions.service';

export const E911_ADDRESS_PENDING: string = 'PENDING';

export default angular
  .module('huron.settings', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/lineSettings/callerIdService'),
    require('modules/huron/settings/voicemailMessageAction.service'),
    require('modules/huron/pstnSetup/terminusServices'),
    require('modules/huron/pstnSetup/pstnSetup.service'),
    require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.service'),
    require('modules/huron/pstnSetup/pstnSetupStates.service'),
    numberServiceModule,
    dialPlanServiceModule,
    siteServiceModule,
    modalServiceModule,
    customerServiceModule,
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
    externalTransferModule,
  ])
  .component('ucSettings', new HuronSettingsComponent())
  .service('HuronSettingsService', HuronSettingsService)
  .service('HuronSettingsOptionsService', HuronSettingsOptionsService)
  .name;
