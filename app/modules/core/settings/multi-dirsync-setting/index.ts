import { MultiDirSyncSettingComponent } from './multiDirsyncSetting.component';
import { MultiDirSyncSettingService } from './multiDirsync.service';
import { DirsyncRowComponent } from './dirsync-row/dirsync-row.component';

import modalModule from 'modules/core/modal';
import notificationModule from 'modules/core/notifications';

import './multi-dirsync-setting.scss';

export default angular.module('core.settings.multi-dirsync', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  modalModule,
  notificationModule,
])
  .component('multiDirsyncSetting', new MultiDirSyncSettingComponent())
  .component('dirsyncRow', new DirsyncRowComponent())
  .service('MultiDirSyncSettingService', MultiDirSyncSettingService)
  .name;
