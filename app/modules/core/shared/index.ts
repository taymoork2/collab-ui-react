import multiStepModalModuleName from './multi-step-modal';
import taskContainerModuleName from './task-container';

export default angular
  .module('core.shared', [
    multiStepModalModuleName,
    taskContainerModuleName,
  ])
  .name;
