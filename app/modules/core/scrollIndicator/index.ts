import './scrollIndicator.scss';

import { ScrollIndicatorDirective } from './scrollIndicator.directive';

export default angular
  .module('core.scroll-indicator', [
    'atlas.templates',
    'collab.ui',
  ])
  .directive('scrollIndicator', ScrollIndicatorDirective.factory)
  .name;
