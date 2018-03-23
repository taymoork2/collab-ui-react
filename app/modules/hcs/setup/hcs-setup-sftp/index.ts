import { HcsSetupSftpComponent } from './hcs-setup-sftp.component';

export * from './hcs-setup-sftp';
export default angular
  .module('hcs.setup-sftp', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsSetupSftp', new HcsSetupSftpComponent())
  .name;
