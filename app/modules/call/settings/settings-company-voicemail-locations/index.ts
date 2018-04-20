import './settings-company-voicemail-locations.scss';

import { LocationCompanyVoicemailComponent } from './settings-company-voicemail-locations.component';
import serviceSetup from 'modules/huron/serviceSetup';
import phoneNumberServiceModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.company-voicemail-locations', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    serviceSetup,
    phoneNumberServiceModule,
  ])
  .component('ucLocationCompanyVoicemail', new LocationCompanyVoicemailComponent())
  .name;
