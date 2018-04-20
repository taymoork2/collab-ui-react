import './call-park-number.component.scss';

import { CallParkNumberComponent } from './call-park-number.component';
import { CallParkRangeValidator } from './call-park-number-validate-range.directive';
import { CallParkRangeLengthValidator } from './call-park-number-validate-range-length.directive';

export default angular
  .module('huron.call-park-number', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallParkNumber', new CallParkNumberComponent())
  .directive('validateRange', CallParkRangeValidator.factory)
  .directive('validateRangeLength', CallParkRangeLengthValidator.factory)
  .name;
