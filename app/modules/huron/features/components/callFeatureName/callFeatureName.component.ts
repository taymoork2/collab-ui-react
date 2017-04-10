class CallFeatureNameCtrl implements ng.IComponentController {
  public placeholder: string;
  public placeholderKey: string;
  public nameHint: string;
  public nameHintKey: string;
  public name: string;
  public isRequired: boolean;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.placeholder = this.$translate.instant(this.placeholderKey);
    this.nameHint = this.$translate.instant(this.nameHintKey);
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
  public templateUrl = 'modules/huron/features/components/callFeatureName/callFeatureName.html';
  public bindings = {
    placeholderKey: '@',
    nameHintKey: '@',
    name: '<',
    isRequired: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
