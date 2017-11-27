class UsageLineController implements ng.IComponentController {
}

export class UsageLineComponent implements ng.IComponentOptions {
  public controller = UsageLineController;
  public template = require('./usage-line.html');
  public bindings = {
    usage: '<',
    volume: '<',
  };
}
