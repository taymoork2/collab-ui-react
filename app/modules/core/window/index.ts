import { WindowEventService } from './window-event.service';

export { WindowEventService };

export default angular
  .module('core.window', [])
  .service('WindowEventService', WindowEventService)
  .service('WindowLocation', require('./windowLocation'))
  .name;
