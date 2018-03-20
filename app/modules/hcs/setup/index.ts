import { HcsSetupModalComponent } from './hcs-setup-modal.component';
import HcsSetupModalService  from 'modules/hcs/shared';
import setupServiceSelectionModule from 'modules/hcs/setup/selection';
import setupAgentInstallFilesModule from 'modules/hcs/setup/agent-install-file';
import setupSftpServerModule from 'modules/hcs/setup/hcs-setup-sftp';
import setupSoftwareProfileModule from 'modules/hcs/setup/hcs-setup-software-profile';
import './_hcs-setup.scss';
export * from './hcs-setup';

export default angular
  .module('hcs.hcs-setup-modal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    HcsSetupModalService,
    setupServiceSelectionModule,
    setupAgentInstallFilesModule,
    setupSftpServerModule,
    setupSoftwareProfileModule,
  ])
  .component('hcsSetupModal', new HcsSetupModalComponent())
  .name;
