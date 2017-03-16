import './_company-voicemail.scss';

import { CompanyVoicemailComponent } from './companyVoicemail.component';
import serviceSetup from 'modules/huron/serviceSetup';

export default angular
  .module('huron.settings.company-voicemail', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    serviceSetup,
  ])
  .component('ucCompanyVoicemail', new CompanyVoicemailComponent())
  .name;
