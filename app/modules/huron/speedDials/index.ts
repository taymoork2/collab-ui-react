import { SpeedDialComponent } from './speedDials.component';
import { SpeedDialService } from './speedDial.service';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features/services';

export { SpeedDialService, ISpeedDial } from './speedDial.service';

export default angular
  .module('huron.speed-dial', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/accessibility').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    'call.shared.call-destination-translate',
    'Core',
    notifications,
    featureMemberService,
  ])
  .component('ucSpeedDial', new SpeedDialComponent())
  .service('SpeedDialService', SpeedDialService)
  .name;
