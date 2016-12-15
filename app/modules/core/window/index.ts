import { WindowService } from './window.service';

export { WindowService };

export default angular
  .module('core.window', [])
  .service('WindowService', WindowService)
  .service('WindowLocation', require('./windowLocation'))
  .name;
