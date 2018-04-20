import { MediaMgrComponent } from './media-mgr.component';
import { MediaMgrService } from './media-mgr.service';
import notifications from 'modules/core/notifications';
import modalServiceModule from 'modules/core/modal';

import './media-mgr.scss';

export * from './media-mgr.service';

export default angular
  .module('huron.media-mgr', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('ng-file-upload'),
    require('modules/core/accessibility').default,
    require('modules/ediscovery/bytes_filter'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    modalServiceModule,
    notifications,
  ])
  .component('mediaMgr', new MediaMgrComponent())
  .service('MediaMgrService', MediaMgrService)
  .name;

