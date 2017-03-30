import { CompanyCallerIdComponent } from './companyCallerId.component';

export * from './companyNumber';

export default angular
  .module('huron.settings.company-caller-id', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
  ])
  .component('ucCompanyCallerId', new CompanyCallerIdComponent())
  .name;
