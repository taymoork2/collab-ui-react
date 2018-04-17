import { PstnSwivelNumbersComponent } from './pstnSwivelNumbers.component';
import notifications from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';
import featureToggleModule from 'modules/core/featureToggle';
require('bootstrap-tokenfield');

export { TokenMethods } from './tokenMethods';

export const TIMEOUT = 100;
export default angular
  .module('huron.pstn.pstn-swivelNumbers', [
    require('@collabui/collab-ui-ng').default,
    require('angular-timer'),
    require('angular-translate'),
    notifications,
    phoneNumberModule,
    featureToggleModule,
  ])
  .component('ucPstnSwivelNumbers', new PstnSwivelNumbersComponent())
  .name;
