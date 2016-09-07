import { LoadEvent } from './loadEvent.directive';

export default angular
  .module('core.loadEvent', [])
  .directive('loadEvent', LoadEvent.directive)
  .name;