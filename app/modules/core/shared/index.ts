import crProgressbarModuleName from './cr-progressbar';
import multiStepModalModuleName from './multi-step-modal';
import runningTaskStatusModuleName from './running-task-status';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';

export * from './offer-name.keys';

export default angular
  .module('core.shared', [
    crProgressbarModuleName,
    multiStepModalModuleName,
    runningTaskStatusModuleName,
    taskContainerModuleName,
    usageLineModuleName,
  ])
  .name;
