class SiteAssignNumberCtrl implements ng.IComponentController {
  public selected: string;
  public vmselected: string;
  public onChangeFn: Function;
  public onChangeVmFn: Function;
  public messages: any = {};
  public numberOptions: string[];
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public onNumberChanged(): void {
    this.onChangeFn({
      number: this.selected,
    });
  }
  public onVMNumberChanged(): void {
    this.onChangeVmFn({
      vmnumber: this.vmselected,
    });
  }
}

export class SiteAssignNumberComponent implements ng.IComponentOptions {
  public controller = SiteAssignNumberCtrl;
  public template = require('modules/call/bsft/numbers/site-assign-number/site-assign-number.component.html');
  public bindings = {
    onChangeFn: '&',
    onChangeVmFn: '&',
    numberOptions: '<',
  };
}
