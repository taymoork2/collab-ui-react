import './first-time-calling.scss';

import { FirstTimeCallingComponent, FirstTimeCallingController } from './first-time-calling.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('mediafusion.media-service-v2.components.first-time-calling', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('firstTimeCalling', new FirstTimeCallingComponent())
  .controller('FirstTimeCallingController', FirstTimeCallingController)
  .name;
