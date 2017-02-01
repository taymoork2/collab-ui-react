import { CompanyVoicemailComponent } from './companyVoicemail.component';

export default angular
  .module('huron.settings.company-voicemail', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucCompanyVoicemail', new CompanyVoicemailComponent())
  .name;
