import './settings-extension-range.component.scss';

import { ExtensionRangeComponent } from './settings-extension-range.component';
import { ExtensionRangeLengthValidator } from './settings-extension-range-validate-length.directive';
import { ExtensionRangeLessThanValidator } from './settings-extension-range-validate-less-than.directive';
import { ExtensionRangeOverlapValidator } from './settings-extension-range-validate-overlap.directive';
import { ExtensionRangeGreaterThanValidator } from './settings-extension-range-validate-greater-than.directive';
import { ExtensionRangeSingleNumberValidator } from './settings-extension-range-validate-single-number.directive';

export { ExtensionRangeComponent };

export default angular
  .module('call.settings.extension-range', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucExtensionRange', new ExtensionRangeComponent())
  .directive('validateExtensionRangeLength', ExtensionRangeLengthValidator.factory)
  .directive('validateExtensionLessThan', ExtensionRangeLessThanValidator.factory)
  .directive('validateExtensionOverlap', ExtensionRangeOverlapValidator.factory)
  .directive('validateExtensionGreaterThan', ExtensionRangeGreaterThanValidator.factory)
  .directive('validateExtensionSingleNumber', ExtensionRangeSingleNumberValidator.factory)
  .name;
