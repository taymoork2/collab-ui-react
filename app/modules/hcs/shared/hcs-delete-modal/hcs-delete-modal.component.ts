export class HcsDeleteModalComponent implements ng.IComponentOptions {
  public controller = HcsDeleteModalCtrl;
  public template = require('./hcs-delete-modal.component.html');
  public bindings = {
    deleteFxn: '&',
    dismiss: '&',
  };
}

export class HcsDeleteModalCtrl implements ng.IComponentController {
  private deleteFxn: Function;
  private dismiss: Function;
  /* @ngInject */
  constructor() {}

  public ok(): void {
    this.deleteFxn();
    this.dismiss();
  }
  public cancel(): void {
    this.dismiss();
  }
}
