export class HcsDeleteModalComponent implements ng.IComponentOptions {
  public controller = HcsDeleteModalCtrl;
  public template = require('./hcs-delete-modal.component.html');
  public bindings = {
    deleteFn: '&',
    dismiss: '&',
    modalTitle: '<',
    modalDescription: '<',
  };
}

export class HcsDeleteModalCtrl implements ng.IComponentController {
  private deleteFn: Function;
  private dismiss: Function;

  public modalTitle: string;
  public modalDescription: string;
  /* @ngInject */
  constructor() {}

  public ok(): void {
    this.deleteFn();
    this.dismiss();
  }
  public cancel(): void {
    this.dismiss();
  }
}
