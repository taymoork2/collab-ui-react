import './_cp-number-lookup.scss';

import { CallParkNumberComponent } from './callParkNumber.component';
import { CallParkRangeValidator } from './cpValidateRange.directive';
import { CallParkRangeLengthValidator } from './cpValidateRangeLength.directive';

export default angular
  .module('huron.call-park-number', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('ucCallParkNumber', new CallParkNumberComponent())
  .directive('validateRange', CallParkRangeValidator.factory)
  .directive('validateRangeLength', CallParkRangeLengthValidator.factory)
  .name;
