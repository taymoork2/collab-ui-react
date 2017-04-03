class ExternalCallTransferCtrl implements ng.IComponentController {
  public allowExternalTransfer: boolean;
  public onChangeFn: Function;
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
  public templateUrl = 'modules/huron/settings/externalCallTransfer/externalCallTransfer.html';
  public bindings = {
    onChangeFn: '&',
    allowExternalTransfer: '<',
  };
}
