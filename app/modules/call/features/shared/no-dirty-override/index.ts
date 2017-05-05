import { NoDirtyOverride } from './no-dirty-override.directive';

export default angular
  .module('call.features.shared.no-dirty-override', [])
  .directive('noDirty', NoDirtyOverride.factory)
  .name;
