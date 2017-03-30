import { PstnSwivelNumbersComponent } from './pstnSwivelNumbers.component';
import notifications from 'modules/core/notifications';

export const TIMEOUT = 100;
export default angular
  .module('huron.pstn-swivelNumbers', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumberService',
    notifications,
  ])
  .component('ucPstnSwivelNumbers', new PstnSwivelNumbersComponent())
  .name;
