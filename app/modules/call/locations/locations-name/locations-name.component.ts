class CallLocationNameCtrl implements ng.IComponentController {
  public name: string;
  public onChangeFn: Function;
  public form: ng.IFormController;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public validationMessages = {
    required: this.$translate.instant('common.invalidRequired'),
  };

  public onNameChanged(): void {
    this.onChangeFn({
      name: this.name,
    });
  }
}

export class CallLocationNameComponent implements ng.IComponentOptions {
  public controller = CallLocationNameCtrl;
  public templateUrl = 'modules/call/locations/locations-name/locations-name.component.html';
  public bindings = {
    name: '<',
    onChangeFn: '&',
  };
}
