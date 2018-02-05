export class UserConvertAutoAssignLicenseSummaryController implements ng.IComponentController {
  public dismiss: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public back() {
    this.$state.go('users.convert');
  }

  public save() {
  }

  public dismissModal() {
    this.dismiss();
  }
}

export class UserConvertAutoAssignLicenseSummaryComponent implements ng.IComponentOptions {
  public controller = UserConvertAutoAssignLicenseSummaryController;
  public template = require('./user-convert-auto-assign-license-summary.html');
  public bindings = {
    dismiss: '&',
  };
}
