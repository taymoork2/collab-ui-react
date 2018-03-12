import { SetupAgentInstallFileComponent } from './setup-agent-install-file.component';
export { TokenMethods } from './tokenMethods';

export default angular
  .module('hcs.setup-agent-install-file', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('setupAgentInstallFile', new SetupAgentInstallFileComponent())
  .name;
