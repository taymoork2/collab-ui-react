import { HuntMethod } from 'modules/call/features/huntGroup/services';

class HuntGroupMethodCtrl implements ng.IComponentController {
  public huntMethod: HuntMethod;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;

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
  public templateUrl = 'modules/call/features/huntGroup/huntGroupMethod/huntGroupMethod.html';
  public bindings = {
    huntMethod: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
