import { HuntMethod } from 'modules/call/features/hunt-group';
import { AccessibilityService } from 'modules/core/accessibility';

class HuntGroupMethodCtrl implements ng.IComponentController {
  public huntMethod: HuntMethod;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public setFocus: boolean;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private AccessibilityService: AccessibilityService,
  ) {  }

  public $onInit() {
    if (this.setFocus) {
      this.AccessibilityService.setFocus(this.$element, '#firstHuntMethod', 100);
    }
  }

  public setHuntMethod(method: HuntMethod): void {
    this.huntMethod = method;
    this.onChangeFn({
      method: method,
    });
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }
}

export class HuntGroupMethodComponent implements ng.IComponentOptions {
  public controller = HuntGroupMethodCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group-method/hunt-group-method.component.html');
  public bindings = {
    huntMethod: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
    setFocus: '<?',
  };
}
