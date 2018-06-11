import { DirSyncSettingComponent } from './dirSyncSetting.component';
import { DirSyncStatusRowComponent } from './dirSyncStatusRow.component';
import { DirConnectorsComponent } from './dirConnectors.component';
import { DirSyncComponent } from './dirSync.component';

import featureToggleModule from 'modules/core/featureToggle';
import modalModule from 'modules/core/modal';
import notificationModule from 'modules/core/notifications';

import './_dirSync.scss';

export default angular.module('core.settings.dirsync', [
  require('angular-cache'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/logmetricsservice'),
  featureToggleModule,
  modalModule,
  notificationModule,
])
  .component('dirSyncConfig', new DirSyncComponent())
  .component('dirsyncSetting', new DirSyncSettingComponent())
  .component('dirSyncStatusRow', new DirSyncStatusRowComponent())
  .component('dirConnectorsConfig', new DirConnectorsComponent())
  .name;
