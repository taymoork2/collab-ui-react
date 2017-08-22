import './settings-company-voicemail-locations.scss';

import { LocationCompanyVoicemailComponent } from './settings-company-voicemail-locations.component';
import serviceSetup from 'modules/huron/serviceSetup';

export default angular
  .module('call.settings.company-voicemail-locations', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    serviceSetup,
  ])
  .component('ucLocationCompanyVoicemail', new LocationCompanyVoicemailComponent())
  .name;
