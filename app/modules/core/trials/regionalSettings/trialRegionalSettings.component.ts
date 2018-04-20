import { HuronCountryService } from 'modules/huron/countries';
import { HuronCompassService } from 'modules/huron/compass/compass.service';

export class TrialRegionalSettingsComponent implements ng.IComponentOptions {
  public controller = TrialRegionalSettingsCtrl;
  public template = require('./trialRegionalSettings.html');
  public bindings = {
    isFtsw: '<',
    callTrialEnabled: '<',
    defaultCountry: '<',
    onChangeFn: '&',
    showError: '<',
    selectName: '@',
    newTrial: '<',
  };
}

interface ICountry {
  id: string;
  name: string;
  domain: string;
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
  private countryCode: any;
  public newTrial: boolean;
  public isFtsw: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $element: ng.IRootElementService,
    private HuronCountryService: HuronCountryService,
    private $q: ng.IQService,
    private HuronCompassService: HuronCompassService,
    private TrialPstnService,
  ) {
    this.notApplicable = {
      id: 'N/A',
      name: this.$translate.instant('serviceSetupModal.notApplicable'),
      domain: '',
    };
  }

  public $onInit(): void {
    this.placeholder = this.$translate.instant('serviceSetupModal.defaultCountryPlaceholder');
    this.errorMessage = this.$translate.instant('common.invalidRequired');
    const promises = {
      countryList: this.HuronCountryService.getCountryList(),
      countryCode: this.TrialPstnService.getCountryCode(),
    };

    this.$q.all(promises).then((data) => {
      this.countryList = [...data['countryList'], ...this.countryList];
      this.countryCode = data['countryCode'];
    }).then(() => {
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
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { callTrialEnabled } = changes;

    if (callTrialEnabled) {
      if (callTrialEnabled.currentValue) {
        if (_.includes(this.countryList, this.notApplicable)) {
          this.countryList = _.dropRight(this.countryList);
        }
      } else if (!_.includes(this.countryList, this.notApplicable)) {
        this.countryList = _.unionWith(this.countryList, [this.notApplicable], _.isEqual);
      }
    }
  }

  public $postLink(): void {
    if (!this.isFtsw) {
      this.$element.addClass('cs-form__section');
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
