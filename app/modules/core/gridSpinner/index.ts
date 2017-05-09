import './gridSpinner.scss';

import { GridSpinnerDirective } from './gridSpinner.directive';

export default angular
  .module('core.grid-spinner', [
  ])
  .directive('gridSpinner', GridSpinnerDirective.factory)
  .name;
