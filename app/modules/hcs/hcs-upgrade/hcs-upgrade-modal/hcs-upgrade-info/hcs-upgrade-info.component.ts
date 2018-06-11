export class HcsUpgradeInfoController implements ng.IComponentController {
  public dismiss: Function;
  public currentVersion;
  public upgradeTo;
  public clusterName;

  public dismissModal(): void {
    this.dismiss();
  }
}

export class HcsUpgradeInfoComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeInfoController;
  public template = require('./hcs-upgrade-info.component.html');
  public bindings = {
    dismiss: '&',
    currentVersion: '<',
    upgradeTo: '<',
    clusterName: '<',
  };
}
