import { SpeedDialComponent } from './speedDials.component';
import { SpeedDialService } from './speedDial.service';
import notifications from 'modules/core/notifications';

export { SpeedDialService, ISpeedDial } from './speedDial.service';

export default angular
  .module('huron.speed-dial', [
    'huron.telephoneNumber',
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    'dragularModule',
    'Core',
    notifications,
  ])
  .component('ucSpeedDial', new SpeedDialComponent())
  .service('SpeedDialService', SpeedDialService)
  .name;
