import './scrollIndicator.scss';

import { ScrollIndicatorDirective } from './scrollIndicator.directive';

export default angular
  .module('core.scroll-indicator', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .directive('scrollIndicator', ScrollIndicatorDirective.factory)
  .name;
