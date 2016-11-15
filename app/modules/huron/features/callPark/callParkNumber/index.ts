import { CallParkNumberComponent } from './callParkNumber.component';
import { CallParkRangeValidator } from './cpValidateRange.directive';
import { CallParkRangeLengthValidator } from './cpValidateRangeLength.directive';

export default angular
  .module('huron.call-park-number', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucCallParkNumber', new CallParkNumberComponent())
  .directive('validateRange', CallParkRangeValidator.factory)
  .directive('validateRangeLength', CallParkRangeLengthValidator.factory)
  .name;
