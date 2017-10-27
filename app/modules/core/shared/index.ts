import multiStepModalModuleName from './multi-step-modal';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';
import runningTaskStatusModuleName from './running-task-status';

export * from './offer-name.keys';

export default angular
  .module('core.shared', [
    multiStepModalModuleName,
    taskContainerModuleName,
    usageLineModuleName,
    runningTaskStatusModuleName,
  ])
  .name;
