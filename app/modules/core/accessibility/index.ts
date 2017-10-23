import { AccessibilityService, KeyCodes } from './accessibility.service';

export {
  AccessibilityService,
  KeyCodes,
};

export default angular
  .module('core.accessibility', [])
  .service('AccessibilityService', AccessibilityService)
  .name;
