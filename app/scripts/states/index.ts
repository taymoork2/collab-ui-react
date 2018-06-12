import configureIntegrationsManagement from './integrations-management.states';

export function configureStates($stateProvider: ng.ui.IStateProvider) {
  configureIntegrationsManagement($stateProvider);
}
