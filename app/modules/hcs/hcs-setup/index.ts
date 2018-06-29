import { HcsSetupModalComponent } from './hcs-setup-modal.component';
import sharedModule from 'modules/hcs/hcs-shared';
import setupServiceSelectionModule from 'modules/hcs/hcs-setup/hcs-setup-selection';
import setupAgentInstallFilesModule from 'modules/hcs/hcs-setup/hcs-setup-agent-install-file';
import setupSftpServerModule from 'modules/hcs/hcs-setup/hcs-setup-sftp';
import setupSwprofileModule from 'modules/hcs/hcs-setup/hcs-setup-swprofile';
import { HcsSetupFinishDirectiveFactory } from './hcs-setup-finish.directive';
import './hcs-setup.scss';

export * from './hcs-setup';

export default angular
  .module('hcs.hcs-setup-modal', [
    require('@collabui/collab-ui-ng').default,
    require('modules/hcs/hcs-shared').default,
    require('angular-translate'),
    sharedModule,
    setupServiceSelectionModule,
    setupAgentInstallFilesModule,
    setupSftpServerModule,
    setupSwprofileModule,
  ])
  .component('hcsSetupModal', new HcsSetupModalComponent())
  .directive('hcsSetupFinish', HcsSetupFinishDirectiveFactory)
  .name;
