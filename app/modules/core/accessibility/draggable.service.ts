import { AccessibilityService, KeyCodes } from './index';

export interface IDraggableDataObject {
  elem: ng.IRootElementService;
  identifier: string;
  itemIdentifier: string;
  list: any[];
  scope?: ng.IScope;
  transitClass: string;
}

export class DraggableInstance {
  public reordering = true;
  public selectedItem: any;

  private dragularInstance: any;

  constructor(
    private $element: ng.IRootElementService,
    private AccessibilityService: AccessibilityService,
    private dragularService,
    private identifier: string,
    private itemIdentifier: string,
    private transitClass: string,
    private scope,
    public list: any[],
  ) {
    this.dragularInstance = this.createDragularInstance();

    const draggableElement = this.$element.find(this.identifier);
    draggableElement.on('click', ($event): void => {
      if (this.reordering && !_.isUndefined(this.selectedItem)) {
        const focusableList = draggableElement.find(`.${this.transitClass}`);
        if (focusableList.index($event.target) === -1) {
          this.selectedItem = undefined;
          this.scope.$apply();
        }
      }
    });
  }

  public keyPress($event: KeyboardEvent, item: any) {
    if (!this.reordering) {
      return;
    }

    const keycode = $event.which;
    const itemIndex = this.list.indexOf(item);
    const listlength = this.list.length - 1;

    switch (keycode) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        if (_.isUndefined(this.selectedItem)) {
          this.selectedItem = item;
        } else {
          this.selectedItem = undefined;
        }
        break;
      case KeyCodes.UP:
        if (itemIndex > 0) {
          if (_.isUndefined(this.selectedItem)) {
            this.AccessibilityService.setFocus(this.$element, `${this.itemIdentifier}${itemIndex - 1}`);
          } else {
            this.pushItem(keycode);
          }
        }
        break;
      case KeyCodes.DOWN:
        if (itemIndex < listlength) {
          if (_.isUndefined(this.selectedItem)) {
            this.AccessibilityService.setFocus(this.$element, `${this.itemIdentifier}${itemIndex + 1}`);
          } else {
            this.pushItem(keycode);
          }
        }
        break;
      case KeyCodes.TAB: // prevent tab from breaking arrow navigation
        if ($event.shiftKey && this.selectedItem && itemIndex > 0) {
          $event.preventDefault();
          $event.stopPropagation();
          this.pushItem(KeyCodes.UP);
        } else if (!$event.shiftKey && this.selectedItem && itemIndex < listlength) {
          $event.preventDefault();
          $event.stopPropagation();
          this.pushItem(KeyCodes.DOWN);
        } else { // resets to undefined for tabbing out of the speed dial re-order menu
          this.selectedItem = undefined;
        }
        break;
    }
  }

  public refreshDragularInstance(list: any[]) {
    this.dragularInstance.destroy();
    this.list = list;
    this.dragularInstance = this.createDragularInstance();
  }

  private createDragularInstance() {
    return this.dragularService(this.identifier, {
      classes: {
        transit: `${this.transitClass}-transit`,
      },
      containersModel: [this.list],
      moves: () => {
        return this.reordering;
      },
    });
  }

  private pushItem(keyCode: Number): void {
    if (this.selectedItem) {
      const index = this.list.indexOf(this.selectedItem);
      const reorderList = _.cloneDeep(this.list);
      reorderList.splice(index, 1);  // remove selectedItem from list

      // reinsert selectedItem into list at new position
      if (keyCode === KeyCodes.UP) {
        reorderList.splice(index - 1, 0, this.selectedItem);
      } else {
        reorderList.splice(index + 1, 0, this.selectedItem);
      }

      this.dragularInstance.destroy();
      this.list = reorderList;
      this.dragularInstance = this.createDragularInstance();

      this.AccessibilityService.setFocus(this.$element, `${this.itemIdentifier}${this.list.indexOf(this.selectedItem)}`);
    }
  }
}

export class DraggableService {
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private AccessibilityService: AccessibilityService,
    private dragularService,
  ) {}

  public createDraggableInstance(options: IDraggableDataObject) {
    let scope = options.scope;
    if (_.isUndefined(scope)) {
      scope = this.$rootScope;
    }

    return new DraggableInstance(options.elem, this.AccessibilityService, this.dragularService, options.identifier, options.itemIdentifier, options.transitClass, scope, options.list);
  }
}
