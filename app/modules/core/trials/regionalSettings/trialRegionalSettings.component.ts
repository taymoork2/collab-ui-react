import { HuronCountryService } from 'modules/huron/countries';
import { HuronCompassService } from 'modules/huron/compass/compass.service';

export class TrialRegionalSettingsComponent implements ng.IComponentOptions {
  public controller = TrialRegionalSettingsCtrl;
  public templateUrl = 'modules/core/trials/regionalSettings/trialRegionalSettings.html';
  public bindings = {
    callTrialEnabled: '<',
    defaultCountry: '<',
    onChangeFn: '&',
    showError: '<',
    selectName: '@',
    newTrial: '<',
  };
}

class TrialRegionalSettingsCtrl implements ng.IComponentController {
  public defaultCountry: ICountry;
  public countryList;
  public onChangeFn: Function;
  public showError: boolean;
  public placeholder: string;
  public errorMessage: string;
  public selectName: string;
  private notApplicable: ICountry;
  private ftHuronFederatedSparkCall: any;
  private countryCode: any;
  public newTrial: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $element: ng.IRootElementService,
    private HuronCountryService: HuronCountryService,
    private FeatureToggleService,
    private $q: ng.IQService,
    private HuronCompassService: HuronCompassService,
    private TrialPstnService,
  ) { }

  public $onInit(): void {
    this.placeholder = this.$translate.instant('serviceSetupModal.defaultCountryPlaceholder');
    this.errorMessage = this.$translate.instant('common.invalidRequired');
    const promises = {
      countryList: this.HuronCountryService.getCountryList(),
      huronFederatedSparkCall: this.FeatureToggleService.supports('huron-federated-spark-call'),
      countryCode: this.TrialPstnService.getCountryCode(),
    };

    this.$q.all(promises).then((data) => {
      this.countryList = data['countryList'];
      this.ftHuronFederatedSparkCall = data['huronFederatedSparkCall'];
      this.countryCode = data['countryCode'];
    }).then(() => {
      this.countryList = this.filterCountryList(this.countryList);
      if (!this.newTrial) {
        const defaultCode = this.countryCode;
        const selectedCountry = _.find(this.countryList, function (country: ICountry) {
          return country.id === defaultCode;
        });
        if (selectedCountry) {
          this.defaultCountry = selectedCountry;
        }
      }
    });

    this.notApplicable = {
      id: 'N/A',
      name: this.$translate.instant('serviceSetupModal.notApplicable'),
      domain: '',
    };
  }

  public $postLink(): void {
    this.$element.addClass('cs-form__section');
  }

  set callTrialEnabled(value: boolean) {
    if (value) {
      if (_.includes(this.countryList, this.notApplicable)) {
        this.countryList = _.dropRight(this.countryList);
      }
    } else if (!_.includes(this.countryList, this.notApplicable)) {
      this.countryList = _.unionWith(this.countryList, [this.notApplicable], _.isEqual);
    }
  }

  private filterCountryList(countryList) {
    if (this.ftHuronFederatedSparkCall) {
      return countryList;
    } else {
      return _.filter(countryList, country => {
        const countryId = _.get(country, 'id');
        return _.includes(['US', 'CA', 'N/A'], countryId);
      });
    }
  }

  public onChange(): void {
    this.HuronCompassService.setCustomerBaseDomain(this.defaultCountry.domain);
    this.onChangeFn({
      country: this.defaultCountry,
    });
  }

  public displayError(): boolean {
    return this.showError && _.isEmpty(this.defaultCountry);
  }
}

interface ICountry {
  id: string;
  name: string;
  domain: string;
}
