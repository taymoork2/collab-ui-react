import { CompanyMediaOnHoldComponent } from './settings-company-moh.component';

export default angular
  .module('call.settings.company-moh', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCompanyMediaOnHold', new CompanyMediaOnHoldComponent())
  .name;
