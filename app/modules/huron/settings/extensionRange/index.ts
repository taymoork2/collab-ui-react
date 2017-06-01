import './_extension-range.scss';

import { ExtensionRangeComponent } from './extensionRange.component';
import { ExtensionRangeLengthValidator } from './extenstionRangeValidateLength.directive';
import { ExtensionRangeLessThanValidator } from './extensionRangeValidateLessThan.directive';
import { ExtensionRangeOverlapValidator } from './extensionRangeValidateOverlap.directive';
import { ExtensionRangeGreaterThanValidator } from './extensionRangeValidateGreaterThan.directive';
import { ExtensionRangeSingleNumberValidator } from './extensionRangeValidateSingleNumber.directive';

export * from './extensionRange.component';
export * from './extensionRange';

export default angular
  .module('huron.settings.extension-range', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucExtensionRange', new ExtensionRangeComponent())
  .directive('validateExtensionRangeLength', ExtensionRangeLengthValidator.factory)
  .directive('validateExtensionLessThan', ExtensionRangeLessThanValidator.factory)
  .directive('validateExtensionOverlap', ExtensionRangeOverlapValidator.factory)
  .directive('validateExtensionGreaterThan', ExtensionRangeGreaterThanValidator.factory)
  .directive('validateExtensionSingleNumber', ExtensionRangeSingleNumberValidator.factory)
  .name;
