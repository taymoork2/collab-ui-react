import { NoDirtyOverride } from './no-dirty-override.directive';

export default angular
  .module('huron.no-dirty-override', [])
  .directive('noDirty', NoDirtyOverride.factory)
  .name;
