class ExternalCallTransferCtrl implements ng.IComponentController {
  public allowExternalTransfer: boolean;
  public onChangeFn: Function;
  public location: boolean;
  /* @ngInject */
  constructor() { }

  public onExternalTransferToggled(toggleValue: boolean): void {
    this.allowExternalTransfer = toggleValue;
    this.onChangeFn({
      allowExternalTransfer: this.allowExternalTransfer,
    });
  }
}

export class ExternalCallTransferComponent implements ng.IComponentOptions {
  public controller = ExternalCallTransferCtrl;
  public template = require('modules/call/settings/settings-external-call-transfer/settings-external-call-transfer.component.html');
  public bindings = {
    location: '<',
    allowExternalTransfer: '<',
    onChangeFn: '&',
  };
}
