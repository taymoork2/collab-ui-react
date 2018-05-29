import bannerModuleName from './banner';
import crIconInfoModuleName from './cr-icon-info';
import crProgressbarModuleName from './cr-progressbar';
import multiStepModalModuleName from './multi-step-modal';
import offerNameModuleName from './offer-name';
import runningTaskStatusModuleName from './running-task-status';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';
import waitingIntervalModuleName from './waiting-interval';

import { RetryingPromiseService } from './retrying-promise.service';
export { RetryingPromiseService };
import { StringUtilService } from './string-util.service';
import crTotalTileModuleName from './cr-total-tile';
export { StringUtilService };

export default angular
  .module('core.shared', [
    bannerModuleName,
    crIconInfoModuleName,
    crProgressbarModuleName,
    crTotalTileModuleName,
    multiStepModalModuleName,
    offerNameModuleName,
    runningTaskStatusModuleName,
    taskContainerModuleName,
    usageLineModuleName,
    waitingIntervalModuleName,
  ])
  .service('RetryingPromiseService', RetryingPromiseService)
  .service('StringUtilService', StringUtilService)
  .name;
