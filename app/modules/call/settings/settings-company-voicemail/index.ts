import './settings-company-voicemail.component.scss';

import { CompanyVoicemailComponent } from './settings-company-voicemail.component';
import serviceSetup from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.company-voicemail', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    serviceSetup,
    phoneNumberModule,
  ])
  .component('ucCompanyVoicemail', new CompanyVoicemailComponent())
  .name;
