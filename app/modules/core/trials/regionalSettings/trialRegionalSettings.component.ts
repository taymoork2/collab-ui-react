class TrialRegionalSettingsCtrl implements ng.IComponentController {
  public defaultCountry: string;
  public defaultCountryList;
  public onChangeFn: Function;
  public placeholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $element: ng.IRootElementService,
  ) {}

  public $onInit(): void {
    this.placeholder = this.$translate.instant('partnerHomePage.defaultCountryPlaceholder');
  }

  public $postLink(): void {
    this.$element.addClass('cs-form__section');
  }

  public onChange(): void {
    this.onChangeFn({
      country: this.defaultCountry,
    });
  }
}

export class TrialRegionalSettingsComponent implements ng.IComponentOptions {
  public controller = TrialRegionalSettingsCtrl;
  public templateUrl = 'modules/core/trials/regionalSettings/trialRegionalSettings.html';
  public bindings = {
    defaultCountry: '<',
    defaultCountryList: '<',
    onChangeFn: '&',
  };
}
