import { MediaMgrComponent } from 'modules/huron/media-mgr/media-mgr.component';
import { MediaMgrService } from 'modules/huron/media-mgr/media-mgr.service';
import 'modules/huron/media-mgr/media-mgr.scss';
import notifications from 'modules/core/notifications';

export * from './media-mgr.service';

export default angular
  .module('huron.media-mgr', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('ng-file-upload'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    notifications,
  ])
  .component('mediaMgr', new MediaMgrComponent())
  .service('MediaMgrService', MediaMgrService)
  .name;
