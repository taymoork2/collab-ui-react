import { MultiDirSyncSettingComponent } from './multi-dirsync-setting/multi-dirsync-setting.component';
import { MultiDirSyncSectionComponent } from './multi-dirsync-section/multi-dirsync-section.component';
import { MultiDirSyncService } from './multi-dirsync.service';
import { DirsyncRowComponent } from './dirsync-row/dirsync-row.component';

import * as analyticsModuleName from 'modules/core/analytics';
import modalModuleName from 'modules/core/modal';
import notificationModuleName from 'modules/core/notifications';

import './multi-dirsync.scss';

export * from './multi-dirsync.interfaces';

export default angular.module('core.settings.multi-dirsync', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  modalModuleName,
  notificationModuleName,
])
  .component('multiDirsyncSection', new MultiDirSyncSectionComponent())
  .component('multiDirsyncSetting', new MultiDirSyncSettingComponent())
  .component('dirsyncRow', new DirsyncRowComponent())
  .service('MultiDirSyncService', MultiDirSyncService)
  .name;
