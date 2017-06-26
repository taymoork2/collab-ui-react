import { CompanyMediaOnHoldComponent } from './companyMoh.component';

export default angular
  .module('huron.settings.company-moh', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCompanyMediaOnHold', new CompanyMediaOnHoldComponent())
  .name;
