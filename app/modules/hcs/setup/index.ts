import { HcsSetupModalComponent } from './hcs-setup-modal.component';
import HcsSetupModalService  from 'modules/hcs/services';
import setupServiceSelectionModule from 'modules/hcs/setup/selection';
import setupAgentInstallFilesModule from 'modules/hcs/setup/agent-install-file';
import './_hcs-setup.scss';
export * from './hcs-setup';

export default angular
  .module('hcs.hcs-setup-modal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    HcsSetupModalService,
    setupServiceSelectionModule,
    setupAgentInstallFilesModule,
  ])
  .component('hcsSetupModal', new HcsSetupModalComponent())
  .name;
