import { CompanyCallerIdComponent } from './companyCallerId.component';
import { CallerIdPhoneNumberValidator } from './companyCallerIdValidatePhoneNumber.directive';
import phoneNumberModule from 'modules/huron/phoneNumber';

export * from './companyNumber';

export default angular
  .module('huron.settings.company-caller-id', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('ucCompanyCallerId', new CompanyCallerIdComponent())
  .directive('validateCallerIdPhoneNumber', CallerIdPhoneNumberValidator.factory)
  .name;
