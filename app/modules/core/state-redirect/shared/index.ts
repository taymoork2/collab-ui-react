import * as uiRouterModuleName from 'angular-ui-router/release/angular-ui-router';
import * as PreviousState from './previous-state.service';

export default angular
  .module('core.state-redirect.shared', [
    uiRouterModuleName,
  ])
  .factory('PreviousState', PreviousState)
  .name;
