import configureIntegrationsManagement from './integrations-management.states';
import configureJabberToWebexTeams from './jabber-to-webex-teams.states';

export function configureStates($stateProvider: ng.ui.IStateProvider) {
  configureIntegrationsManagement($stateProvider);
  configureJabberToWebexTeams($stateProvider);
}
