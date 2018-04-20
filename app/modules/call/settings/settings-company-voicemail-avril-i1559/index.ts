import { CompanyVoicemailAvrilI1559Component } from './settings-company-voicemail-avril-i1559.component';
import serviceSetupModule from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.company-voicemail-avril-i1559', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/featureToggle').default,
    serviceSetupModule,
    phoneNumberModule,
  ])
  .component('ucCompanyVoicemailAvrilI1559', new CompanyVoicemailAvrilI1559Component())
  .name;
