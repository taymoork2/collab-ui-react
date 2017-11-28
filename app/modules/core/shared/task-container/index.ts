import './task-container.scss';

import { TaskContainerComponent } from './task-container.component';

export default angular.module('core.shared.task-container', [])
  .component('taskContainer', new TaskContainerComponent())
  .name;
