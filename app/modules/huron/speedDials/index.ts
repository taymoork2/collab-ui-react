import { SpeedDialComponent } from './speedDials.component';
import { SpeedDialService } from './speedDial.service';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features';

export { SpeedDialService, ISpeedDial } from './speedDial.service';

export default angular
  .module('huron.speed-dial', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    'dragularModule',
    'Core',
    notifications,
    featureMemberService,
  ])
  .component('ucSpeedDial', new SpeedDialComponent())
  .service('SpeedDialService', SpeedDialService)
  .name;
