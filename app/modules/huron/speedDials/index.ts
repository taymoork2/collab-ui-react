import { SpeedDialComponent } from './speedDials.component';
import { SpeedDialService } from './speedDial.service';
export { SpeedDialService, ISpeedDial } from './speedDial.service';

export default angular
  .module('huron.speed-dial', [
    'huron.telephoneNumber',
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    'dragularModule',
    'Core',
    require('modules/core/notifications/notifications.module'),
  ])
  .component('ucSpeedDial', new SpeedDialComponent())
  .service('SpeedDialService', SpeedDialService)
  .name;
