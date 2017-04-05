class TrialRegionalSettingsCtrl implements ng.IComponentController {
  public defaultCountry: string;
  public defaultCountryList;
  public countryList;
  public filterCountryList: boolean;
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

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { defaultCountryList } = changes;
    if (defaultCountryList && defaultCountryList.currentValue) {
      this.processDefaultCountryListChanges(defaultCountryList);
    }
  }

  public $postLink(): void {
    this.$element.addClass('cs-form__section');
  }

  private processDefaultCountryListChanges(defaultCountryListChanges: ng.IChangesObject): void {
    this.countryList = this.getCountryList(defaultCountryListChanges.currentValue);
  }

  private getCountryList(list) {
    if (this.filterCountryList) {
      return _.filter(list, country => {
        const countryId = _.get(country, 'id');
        return _.includes(['US', 'CA', 'N/A'], countryId);
      });
    } else {
      return list;
    }
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
    filterCountryList: '<',
    onChangeFn: '&',
  };
}
