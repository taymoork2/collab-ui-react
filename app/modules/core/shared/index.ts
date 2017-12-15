import crProgressbarModuleName from './cr-progressbar';
import multiStepModalModuleName from './multi-step-modal';
import runningTaskStatusModuleName from './running-task-status';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';

import { StringUtilService } from './string-util.service';
export { StringUtilService };
export { OfferName } from './offer-name.keys';

export default angular
  .module('core.shared', [
    crProgressbarModuleName,
    multiStepModalModuleName,
    runningTaskStatusModuleName,
    taskContainerModuleName,
    usageLineModuleName,
  ])
  .service('StringUtilService', StringUtilService)
  .name;
