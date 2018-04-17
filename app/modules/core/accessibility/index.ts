import { AccessibilityService, KeyCodes } from './accessibility.service';
import { DraggableService, DraggableInstance } from './draggable.service';

export {
  AccessibilityService,
  DraggableService,
  DraggableInstance,
  KeyCodes,
};

export default angular
  .module('core.accessibility', [
    'dragularModule',
  ])
  .service('AccessibilityService', AccessibilityService)
  .service('DraggableService', DraggableService)
  .name;
