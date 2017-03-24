import { SpeedDialComponent } from './speedDials.component';
import { SpeedDialService } from './speedDial.service';
export { SpeedDialService, ISpeedDial } from './speedDial.service';
import notifications from 'modules/core/notifications';
import customerServiceModule from 'modules/huron/customer';
import featureMemberService from 'modules/huron/features';

export default angular
  .module('huron.speed-dial', [
    'huron.telephoneNumber',
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'dragularModule',
    'Core',
    customerServiceModule,
    notifications,
    featureMemberService,
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .component('ucSpeedDial', new SpeedDialComponent())
  .service('SpeedDialService', SpeedDialService)
  .name;
