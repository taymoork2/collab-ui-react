import { HcsFeatureAvailableNotification } from './hcs.factory';

export { HcsFeatureAvailableNotification };

export default angular
  .module('hcs.notifications', [])
  .service('HcsFeatureAvailableNotification', HcsFeatureAvailableNotification)
  .name;
