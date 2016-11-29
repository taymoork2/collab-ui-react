import { NoDirtyOverride } from './noDirty.directive';

export default angular
  .module('huron.no-dirty-override', [])
  .directive('noDirty', NoDirtyOverride.factory)
  .name;
