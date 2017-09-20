class CallLocationNameCtrl implements ng.IComponentController {
  public name: string;
  public onChangeFn: Function;
  public messages: any = {};

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      uniqueAsyncValidator: this.$translate.instant('locations.usedLocation'),
    };
  }

  public onNameChanged(): void {
    this.onChangeFn({
      name: this.name,
    });
  }
}

export class CallLocationNameComponent implements ng.IComponentOptions {
  public controller = CallLocationNameCtrl;
  public template = require('modules/call/locations/locations-name/locations-name.component.html');
  public bindings = {
    name: '<',
    onChangeFn: '&',
  };
}
