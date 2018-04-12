import './first-time-calling.scss';

import { FirstTimeCallingComponent, FirstTimeCallingController } from './first-time-calling.component';
import { FirstTimeCallingService } from './first-time-calling.service';

export default angular.module('mediafusion.media-service-v2.components.first-time-calling', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('firstTimeCalling', new FirstTimeCallingComponent())
  .controller('FirstTimeCallingController', FirstTimeCallingController)
  .service ('FirstTimeCallingService', FirstTimeCallingService)
  .name;
