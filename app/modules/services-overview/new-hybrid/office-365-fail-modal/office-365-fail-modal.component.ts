import './office-365-fail-modal.scss';

class Office365FailModalController implements ng.IComponentController {
  public close: Function;
  public dismiss: Function;

  /* @ngInject */
  constructor(
  ) {}
}

export class Office365FailModalComponent implements ng.IComponentOptions {
  public controller = Office365FailModalController;
  public templateUrl = 'modules/services-overview/new-hybrid/office-365-fail-modal/office-365-fail-modal.html';
  public bindings = {
    reason: '<',
    close: '&',
    dismiss: '&',
  };
}
