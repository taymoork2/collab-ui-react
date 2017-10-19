import { AccessibilityService } from './accessibility.service';

export default angular
  .module('core.accessibility', [])
  .service('AccessibilityService', AccessibilityService)
  .name;
