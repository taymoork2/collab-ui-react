import { CompanyVoicemailAvrilComponent } from './settings-company-voicemail-avril.component';
import serviceSetup from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.company-voicemail-avril', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/featureToggle').default,
    serviceSetup,
    phoneNumberModule,
  ])
  .component('ucCompanyVoicemailAvril', new CompanyVoicemailAvrilComponent())
  .name;
