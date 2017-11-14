import multiStepModalModuleName from './multi-step-modal';
import taskContainerModuleName from './task-container';
import usageLineModuleName from './usage-line';

export default angular
  .module('core.shared', [
    multiStepModalModuleName,
    taskContainerModuleName,
    usageLineModuleName,
  ])
  .name;
