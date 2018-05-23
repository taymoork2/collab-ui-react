import './running-task-status.scss';
import { RunningTaskStatusComponent } from './running-task-status.component';

export default angular
  .module('core.shared.running-task-status', [
    require('@collabui/collab-ui-ng').default,
  ])
  .component('runningTaskStatus', new RunningTaskStatusComponent())
  .name;
