import { DialingSetupComponent } from './dialing.component';
import { DialingAreaCodeValidator } from './dialingValidateAreaCode.directive';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.settings.dialing', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('ucDialingSetup', new DialingSetupComponent())
  .directive('validateDialingAreaCode', DialingAreaCodeValidator.factory)
  .name;
