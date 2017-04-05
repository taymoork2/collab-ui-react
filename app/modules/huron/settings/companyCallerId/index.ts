import { CompanyCallerIdComponent } from './companyCallerId.component';
import { CallerIdPhoneNumberValidator } from './companyCallerIdValidatePhoneNumber.directive';

export * from './companyNumber';

export default angular
  .module('huron.settings.company-caller-id', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
  ])
  .component('ucCompanyCallerId', new CompanyCallerIdComponent())
  .directive('validateCallerIdPhoneNumber', CallerIdPhoneNumberValidator.factory)
  .name;
