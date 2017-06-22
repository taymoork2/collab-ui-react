import { CompanyMediaOnHoldComponent } from './companyMoh.component';

export default angular
  .module('huron.settings.date-format', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucMediaHold', new CompanyMediaOnHoldComponent())
  .name;
