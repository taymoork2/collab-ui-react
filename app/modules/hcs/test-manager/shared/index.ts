import { TaskManagerService } from './task-manager.service';

export * from './task-manager.const';
export * from './task-manager.service';

export default angular
.module('hcs.test-manager.shared', [
  require('modules/core/scripts/services/authinfo'),
  require('angular-resource'),
])
.service('HcsTestManagerService', TaskManagerService)
.name;
