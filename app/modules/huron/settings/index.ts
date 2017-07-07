import { HuronSettingsComponent } from './settings.component';
import { SettingSetupInitComponent } from 'modules/huron/settings/init/settingSetupInit.component';
import { SettingSetupInitService } from 'modules/huron/settings/init/settingSetupInitService';

//module dependancy names
import huronSettingsServiceModule from 'modules/huron/settings/services';
import numberServiceModule from 'modules/huron/numbers';
import dialPlanServiceModule from 'modules/huron/dialPlans';
import modalServiceModule from 'modules/core/modal';
import preferredLanguageModule from 'modules/huron/settings/preferredLanguage';
import extensionRangeModule from 'modules/huron/settings/extensionRange';
import extensionLengthModule from 'modules/huron/settings/extensionLength';
import routingPrefixModule from 'modules/huron/settings/routingPrefix';
import timeZoneModule from 'modules/huron/settings/timeZone';
import outboundDialDigitModule from 'modules/huron/settings/outboundDialDigit';
import companyVoicemailModule from 'modules/huron/settings/companyVoicemail';
import companyVoicemailAvrilModule from 'modules/huron/settings/companyVoicemailAvril';
import dialingModule from 'modules/huron/settings/dialing';
import timeFormatModule from 'modules/huron/settings/timeFormat';
import dateFormatModule from 'modules/huron/settings/dateFormat';
import defaultCountryModule from 'modules/huron/settings/defaultCountry';
import cosRestrictionModule from 'modules/huron/settings/cos';
import companyCallerIdModule from 'modules/huron/settings/companyCallerId';
import companyMohModule from 'modules/huron/settings/companyMoh';
import emergencyServiceNumberModule from 'modules/huron/settings/emergencyServiceNumber';
import emergencyServiceAddressModule from 'modules/huron/settings/emergencyServiceAddress';
import externalTransferModule from 'modules/huron/settings/externalCallTransfer';
import phoneNumberModule from 'modules/huron/phoneNumber';
import featureToggleServiceModule from 'modules/core/featureToggle';
import pstnAreaService from 'modules/huron/pstn/pstnAreaService';

export default angular
  .module('huron.settings', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/pstn/pstn.service').default,
    require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.service'),
    require('modules/huron/settings/voicemailMessageAction.service'),
    numberServiceModule,
    dialPlanServiceModule,
    modalServiceModule,
    preferredLanguageModule,
    extensionRangeModule,
    extensionLengthModule,
    routingPrefixModule,
    timeZoneModule,
    outboundDialDigitModule,
    companyVoicemailModule,
    companyVoicemailAvrilModule,
    dialingModule,
    timeFormatModule,
    dateFormatModule,
    defaultCountryModule,
    cosRestrictionModule,
    companyCallerIdModule,
    emergencyServiceNumberModule,
    emergencyServiceAddressModule,
    externalTransferModule,
    phoneNumberModule,
    companyMohModule,
    huronSettingsServiceModule,
    featureToggleServiceModule,
    pstnAreaService,
  ])
  .component('ucSettings', new HuronSettingsComponent())
  .component('ucSettingsInit', new SettingSetupInitComponent())
  .service('SettingSetupInitService', SettingSetupInitService)
  .name;
