import './settings.component.scss';

import { HuronSettingsComponent } from './settings.component';
import { SettingsNewDirectiveFactory } from './settings-new.directive';
import { SettingsEditDirectiveFactory } from './settings-edit.directive';
import { CallSettingsComponent } from './settings-location.component';

//module dependancy names
import huronSettingsServiceModule from 'modules/call/settings/shared';
import numberServiceModule from 'modules/huron/numbers';
import dialPlanServiceModule from 'modules/huron/dialPlans';
import modalServiceModule from 'modules/core/modal';
import preferredLanguageModule from 'modules/call/settings/settings-preferred-language';
import extensionRangeModule from 'modules/call/settings/settings-extension-range';
import extensionLengthModule from 'modules/call/settings/settings-extension-length';
import routingPrefixModule from 'modules/call/settings/settings-routing-prefix';
import routingPrefixLengthModule from 'modules/call/settings/settings-routing-prefix-length';
import timeZoneModule from 'modules/call/shared/settings-time-zone';
import outboundDialDigitModule from 'modules/call/settings/settings-outbound-dial-digit';
import companyVoicemailModule from 'modules/call/settings/settings-company-voicemail';
import companyVoicemailAvrilModule from 'modules/call/settings/settings-company-voicemail-avril';
import companyVoicemailAvrilI1559Module from 'modules/call/settings/settings-company-voicemail-avril-i1559';
import companyVoicemailLocationModule from 'modules/call/settings/settings-company-voicemail-locations';
import voicemailModule from 'modules/call/settings/settings-voicemail';
import dialingModule from 'modules/call/settings/settings-dialing';
import timeFormatModule from 'modules/call/settings/settings-time-format';
import dateFormatModule from 'modules/call/settings/settings-date-format';
import defaultCountryModule from 'modules/call/settings/settings-default-country';
import cosRestrictionModule from 'modules/call/settings/settings-cos';
import companyCallerIdModule from 'modules/call/settings/settings-company-caller-id';
import companyMohModule from 'modules/call/settings/settings-company-moh';
import emergencyServiceNumberModule from 'modules/call/settings/settings-emergency-service-number';
import emergencyServiceAddressModule from 'modules/call/settings/settings-emergency-service-address';
import externalTransferModule from 'modules/call/settings/settings-external-call-transfer';
import phoneNumberModule from 'modules/huron/phoneNumber';
import featureToggleServiceModule from 'modules/core/featureToggle';
import pstnAreaService from 'modules/huron/pstn/pstnAreaService';
import settingsSetupInitModule from 'modules/call/settings/settings-setup-init';
import settingsCustomerCreateModule from 'modules/call/settings/settings-customer-create';
import trialRegionalSettings from 'modules/core/trials/regionalSettings';

export default angular
  .module('call.settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/pstn/pstn.service').default,
    require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.service'),
    require('modules/call/settings/shared/voicemail-message-action.service'),
    numberServiceModule,
    dialPlanServiceModule,
    modalServiceModule,
    preferredLanguageModule,
    extensionRangeModule,
    extensionLengthModule,
    routingPrefixModule,
    routingPrefixLengthModule,
    timeZoneModule,
    outboundDialDigitModule,
    companyVoicemailModule,
    companyVoicemailAvrilModule,
    companyVoicemailAvrilI1559Module,
    companyVoicemailLocationModule,
    voicemailModule,
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
    settingsSetupInitModule,
    settingsCustomerCreateModule,
    trialRegionalSettings,
  ])
  .component('ucSettings', new HuronSettingsComponent())
  .component('ucCallSettings', new CallSettingsComponent())
  .directive('ucSettingsNew', SettingsNewDirectiveFactory)
  .directive('ucSettingsEdit', SettingsEditDirectiveFactory)
  .name;
