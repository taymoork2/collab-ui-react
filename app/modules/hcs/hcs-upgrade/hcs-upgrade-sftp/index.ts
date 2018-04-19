import 'modules/hcs/hcs-inventory/cluster-list/cluster-list.scss';
import { HcsUpgradeSftpListComponent } from './hcs-upgrade-sftp-list.component';
import { HcsUpgradeSftpEditComponent } from './hcs-upgrade-sftp-edit.component';

export default angular
.module('hcs.sftplist', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
])
.component('hcsUpgradeSftpList', new HcsUpgradeSftpListComponent())
.component('hcsUpgradeSftpEdit', new HcsUpgradeSftpEditComponent())
.name;
