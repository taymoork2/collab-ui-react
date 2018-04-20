import { DraggableInstance, KeyCodes } from './index';
import testModule from './index';

describe('Service: Draggable Service -', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', '$timeout', 'AccessibilityService', 'DraggableService');

    spyOn(this.AccessibilityService, 'setFocus');
    this.id = '#id';
    this.transit = 'transit-class';
    this.itemId = '#item';
    this.list = [ { item: 1 }, { item: 2 }, { item: 3 } ];
    this.reordering = true;
    this.elem = {
      find: jasmine.createSpy('find').and.returnValue({
        focus: _.noop,
        on: _.noop,
      }),
    };

    this.draggableInstance = this.DraggableService.createDraggableInstance({
      elem: this.elem,
      identifier: this.id,
      transitClass: this.transit,
      itemIdentifier: this.itemId,
      list: this.list,
      scope: this.$scope,
    });
  });

  it('createDraggableInstance: should create an object of type IDraggableInstance', function () {
    expect(this.draggableInstance).toEqual(jasmine.any(DraggableInstance));
  });

  describe('keyPress:', function () {
    it('should set/unset selectedItem on Enter/Space keypress', function () {
      this.draggableInstance.keyPress({ which: KeyCodes.ENTER }, this.list[2]);
      expect(this.draggableInstance.selectedItem).toEqual(this.list[2]);

      this.draggableInstance.keyPress({ which: KeyCodes.SPACE }, this.list[2]);
      expect(this.draggableInstance.selectedItem).toBeUndefined();
    });

    it('should move selectedItem up the list on up arrow/shift-tab keypress', function () {
      this.draggableInstance.keyPress({ which: KeyCodes.ENTER }, this.list[2]);

      this.draggableInstance.keyPress({ which: KeyCodes.UP }, this.list[2]);
      this.$timeout.flush();
      expect(this.AccessibilityService.setFocus).toHaveBeenCalledWith(this.elem, this.itemId + this.draggableInstance.list.indexOf(this.list[2]));
      expect(this.draggableInstance.selectedItem).toEqual(this.list[2]);
      expect(this.draggableInstance.list).toEqual([this.list[0], this.list[2], this.list[1]]);

      this.draggableInstance.keyPress({
        which: KeyCodes.TAB,
        shiftKey: true,
        preventDefault: _.noop,
        stopPropagation: _.noop,
      }, this.list[2]);
      this.$timeout.flush();
      expect(this.AccessibilityService.setFocus).toHaveBeenCalledWith(this.elem, this.itemId + this.draggableInstance.list.indexOf(this.list[2]));
      expect(this.draggableInstance.selectedItem).toEqual(this.list[2]);
      expect(this.draggableInstance.list).toEqual([this.list[2], this.list[0], this.list[1]]);
    });

    it('should move selectedItem down the list on down arrow/tab keypress', function () {
      this.draggableInstance.keyPress({ which: KeyCodes.ENTER }, this.list[0]);

      this.draggableInstance.keyPress({ which: KeyCodes.DOWN }, this.list[0]);
      this.$timeout.flush();
      expect(this.AccessibilityService.setFocus).toHaveBeenCalledWith(this.elem, this.itemId + this.draggableInstance.list.indexOf(this.list[0]));
      expect(this.draggableInstance.selectedItem).toEqual(this.list[0]);
      expect(this.draggableInstance.list).toEqual([this.list[1], this.list[0], this.list[2]]);

      this.draggableInstance.keyPress({
        which: KeyCodes.TAB,
        shiftKey: false,
        preventDefault: _.noop,
        stopPropagation: _.noop,
      }, this.list[0]);
      this.$timeout.flush();
      expect(this.AccessibilityService.setFocus).toHaveBeenCalledWith(this.elem, this.itemId + this.draggableInstance.list.indexOf(this.list[0]));
      expect(this.draggableInstance.selectedItem).toEqual(this.list[0]);
      expect(this.draggableInstance.list).toEqual([this.list[1], this.list[2], this.list[0]]);
    });
  });
});
