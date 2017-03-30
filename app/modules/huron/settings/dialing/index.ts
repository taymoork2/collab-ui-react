import { DialingSetupComponent } from './dialing.component';
import { DialingAreaCodeValidator } from './dialingValidateAreaCode.directive';

export default angular
  .module('huron.settings.dialing', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
  ])
  .component('ucDialingSetup', new DialingSetupComponent())
  .directive('validateDialingAreaCode', DialingAreaCodeValidator.factory)
  .name;
