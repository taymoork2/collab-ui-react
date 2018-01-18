import { CompanyCallerIdComponent } from './settings-company-caller-id.component';
import { CallerIdPhoneNumberValidator } from './settings-company-caller-id-validate-phone-number.directive';
import phoneNumberModule from 'modules/huron/phoneNumber';
import pstnModule from 'modules/huron/pstn/pstn.model';
export * from './settings-company-number';

export default angular
  .module('call.settings.company-caller-id', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
    pstnModule,
  ])
  .component('ucCompanyCallerId', new CompanyCallerIdComponent())
  .directive('validateCallerIdPhoneNumber', CallerIdPhoneNumberValidator.factory)
  .name;
