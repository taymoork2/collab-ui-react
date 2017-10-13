class HuntGroupMaxRingTimeCtrl implements ng.IComponentController {
  public maxRingSecs: string;
  public onChangeFn: Function;

  public options: number[] = [10, 15, 20];

  public onMaxRingSecsChange(seconds: number): void {
    this.onChangeFn({
      seconds: seconds,
    });
  }

}

export class HuntGroupMaxRingTimeComponent implements ng.IComponentOptions {
  public controller = HuntGroupMaxRingTimeCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group-max-ring-time/hunt-group-max-ring-time.component.html');
  public bindings = {
    maxRingSecs: '<',
    onChangeFn: '&',
  };
}
