import { CompanyMediaOnHoldComponent } from './settings-company-moh.component';

export default angular
  .module('call.settings.company-moh', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCompanyMediaOnHold', new CompanyMediaOnHoldComponent())
  .name;
