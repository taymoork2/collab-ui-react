import './_company-voicemail.scss';

import { CompanyVoicemailComponent } from './companyVoicemail.component';
import serviceSetup from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.settings.company-voicemail', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    serviceSetup,
    phoneNumberModule,
  ])
  .component('ucCompanyVoicemail', new CompanyVoicemailComponent())
  .name;
