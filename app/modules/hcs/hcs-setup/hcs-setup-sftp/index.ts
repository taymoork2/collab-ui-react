import { HcsSetupSftpComponent } from './hcs-setup-sftp.component';
import { HcsSftpEditDirectiveFactory } from './hcs-sftp-edit.directive';
import { HcsSftpAddDirectiveFactory } from './hcs-sftp-add.directive';

export * from './hcs-setup-sftp';
export default angular
  .module('hcs.setup-sftp', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsSetupSftp', new HcsSetupSftpComponent())
  .directive('hcsSftpAdd', HcsSftpAddDirectiveFactory)
  .directive('hcsSftpEdit', HcsSftpEditDirectiveFactory)
  .name;
