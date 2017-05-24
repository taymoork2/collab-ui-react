import { CompanyVoicemailAvrilComponent } from './companyVoicemailAvril.component';
import serviceSetup from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.settings.company-voicemail-avril', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    serviceSetup,
    phoneNumberModule,
  ])
  .component('ucCompanyVoicemailAvril', new CompanyVoicemailAvrilComponent())
  .name;
