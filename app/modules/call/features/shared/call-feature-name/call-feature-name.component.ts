class CallFeatureNameCtrl implements ng.IComponentController {
  public placeholder: string;
  public placeholderKey: string;
  public nameHint: string;
  public nameHintKey: string;
  public name: string;
  public isRequired: boolean;
  public isNew: boolean;
  public validationRegEx: RegExp;
  public validationRegExMessageKey: string;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public messages: Object;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.placeholder = this.$translate.instant(this.placeholderKey);
    this.nameHint = this.$translate.instant(this.nameHintKey);
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      pattern: this.$translate.instant(this.validationRegExMessageKey),
    };
  }

  public onNameChange(): void {
    this.onChangeFn({
      name: this.name,
    });
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }

}

export class CallFeatureNameComponent implements ng.IComponentOptions {
  public controller = CallFeatureNameCtrl;
  public template = require('modules/call/features/shared/call-feature-name/call-feature-name.component.html');
  public bindings = {
    placeholderKey: '@',
    nameHintKey: '@',
    name: '<',
    isRequired: '<',
    isNew: '<',
    validationRegEx: '<',
    validationRegExMessageKey: '@',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
