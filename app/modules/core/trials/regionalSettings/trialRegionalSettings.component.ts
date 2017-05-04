import { HuronCountryService } from 'modules/huron/countries';
import { HuronCompassService } from '../../../huron/compass/compass.service';

export class TrialRegionalSettingsComponent implements ng.IComponentOptions {
  public controller = TrialRegionalSettingsCtrl;
  public templateUrl = 'modules/core/trials/regionalSettings/trialRegionalSettings.html';
  public bindings = {
    callTrialEnabled: '<',
    onChangeFn: '&',
    defaultCountry: '<',
  };
}

class TrialRegionalSettingsCtrl implements ng.IComponentController {
  public defaultCountry: ICountry;
  public countryList;
  public onChangeFn: Function;
  public placeholder: string;
  private notApplicable: ICountry;
  private ftHuronFederatedSparkCall: any;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $element: ng.IRootElementService,
    private HuronCountryService: HuronCountryService,
    private FeatureToggleService,
    private $q: ng.IQService,
    private HuronCompassService: HuronCompassService,
  ) { }

  public $onInit(): void {
    this.placeholder = this.$translate.instant('serviceSetupModal.defaultCountryPlaceholder');
    const promises = {
      countryList: this.HuronCountryService.getCountryList(),
      huronFederatedSparkCall: this.FeatureToggleService.supports('huron-federated-spark-call'),
    };

    this.$q.all(promises).then((data) => {
      this.countryList = data['countryList'];
      this.ftHuronFederatedSparkCall = data['huronFederatedSparkCall'];
    }).then(() => {
      this.countryList = this.filterCountryList(this.countryList);
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
}

interface ICountry {
  id: string;
  name: string;
  domain: string;
}
