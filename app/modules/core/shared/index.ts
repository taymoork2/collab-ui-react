import crIconInfoModuleName from './cr-icon-info';
import crProgressbarModuleName from './cr-progressbar';
import multiStepModalModuleName from './multi-step-modal';
import offerNameModuleName from './offer-name';
import runningTaskStatusModuleName from './running-task-status';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';
import waitingIntervalModuleName from './waiting-interval';

import { StringUtilService } from './string-util.service';
export { StringUtilService };

export default angular
  .module('core.shared', [
    crIconInfoModuleName,
    crProgressbarModuleName,
    multiStepModalModuleName,
    offerNameModuleName,
    runningTaskStatusModuleName,
    taskContainerModuleName,
    usageLineModuleName,
    waitingIntervalModuleName,
  ])
  .service('StringUtilService', StringUtilService)
  .name;
