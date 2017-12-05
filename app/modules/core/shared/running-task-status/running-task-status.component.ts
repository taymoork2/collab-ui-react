export class RunningTaskStatusCtrl implements ng.IComponentController {

  public anchorText: string;
  public clickCallback: Function;

  /* @ngInject */
  constructor() {}

  public $onInit(): void {}

  public clickComponent(): void {
    this.clickCallback();
  }
}

export class RunningTaskStatusComponent implements ng.IComponentOptions {
  public controller = RunningTaskStatusCtrl;
  public template = require('./running-task-status.html');
  public bindings = {
    anchorText: '<',
    hasRunningTask: '<',
    clickCallback: '&',
  };
}
