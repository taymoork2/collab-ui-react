class HuntGroupMaxRingTimeCtrl implements ng.IComponentController {
  public maxRingSecs: string;
  public onChangeFn: Function;

  public options: Array<number> = [10, 15, 20];

  public onMaxRingSecsChange(seconds: number): void {
    this.onChangeFn({
      seconds: seconds,
    });
  }

}

export class HuntGroupMaxRingTimeComponent implements ng.IComponentOptions {
  public controller = HuntGroupMaxRingTimeCtrl;
  public templateUrl = 'modules/call-features/huntGroup/huntGroupMaxRingTime/huntGroupMaxRingTime.html';
  public bindings = {
    maxRingSecs: '<',
    onChangeFn: '&',
  };
}
