import { MultiDirSyncSettingComponent } from './multi-dirsync-setting/multi-dirsync-setting.component';
import { MultiDirSyncSectionComponent } from './multi-dirsync-section/multi-dirsync-section.component';
import { MultiDirSyncService } from './multi-dirsync.service';
import { DirsyncRowComponent } from './dirsync-row/dirsync-row.component';

import modalModuleName from 'modules/core/modal';
import notificationModuleName from 'modules/core/notifications';
const orgServiceModule = require('modules/core/scripts/services/org.service');

import './multi-dirsync.scss';

export * from './multi-dirsync.interfaces';

export default angular.module('core.settings.multi-dirsync', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/accessibility/three-dot-dropdown').default,
  require('modules/core/accessibility/tooltips').default,
  modalModuleName,
  notificationModuleName,
  orgServiceModule,
])
  .component('multiDirsyncSection', new MultiDirSyncSectionComponent())
  .component('multiDirsyncSetting', new MultiDirSyncSettingComponent())
  .component('dirsyncRow', new DirsyncRowComponent())
  .service('MultiDirSyncService', MultiDirSyncService)
  .name;
