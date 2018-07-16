import bannerModuleName from './banner';
import crCheckboxItemModuleName from './cr-checkbox-item';
import crIconInfoModuleName from './cr-icon-info';
import crProgressbarModuleName from './cr-progressbar';
import crTotalTileModuleName from './cr-total-tile';
import multiStepModalModuleName from './multi-step-modal';
import offerNameModuleName from './offer-name';
import orgSettingsModuleName from './org-settings';
import { RetryingPromiseService } from './retrying-promise.service';
import runningTaskStatusModuleName from './running-task-status';
import sectionTitleModuleName from './section-title';
import { StringUtilService } from './string-util.service';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';
import waitingIntervalModuleName from './waiting-interval';

export { RetryingPromiseService };
export { StringUtilService };

export default angular
  .module('core.shared', [
    bannerModuleName,
    crCheckboxItemModuleName,
    crIconInfoModuleName,
    crProgressbarModuleName,
    crTotalTileModuleName,
    multiStepModalModuleName,
    offerNameModuleName,
    orgSettingsModuleName,
    runningTaskStatusModuleName,
    sectionTitleModuleName,
    taskContainerModuleName,
    usageLineModuleName,
    waitingIntervalModuleName,
  ])
  .service('RetryingPromiseService', RetryingPromiseService)
  .service('StringUtilService', StringUtilService)
  .name;
