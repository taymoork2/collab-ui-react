import { HcsTestManagerService } from './hcs-test-manager.service';

export * from './hcs-test-manager.const';
export * from './hcs-test-manager.service';

export default angular
.module('hcs.test-manager.shared', [
  require('modules/core/scripts/services/authinfo'),
  require('angular-resource'),
])
.service('HcsTestManagerService', HcsTestManagerService)
.name;
