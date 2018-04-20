import {
  SWIVEL, MIN_VALID_CODE, MAX_VALID_CODE, NXX,
  MAX_DID_QUANTITY, MAX_SEARCH_SELECTION,
} from '../pstn.const';
import { Notification } from '../../../core/notifications/notification.service';
import { PstnService } from '../pstn.service';
import { PstnModel } from '../pstn.model';
import { PstnAddressService, Address } from '../shared/pstn-address';
import { NumberModel } from '../pstnNumberSearch';
import { HuronCompassService } from 'modules/huron/compass/compass.service';

interface ITrialData {
  details: {
    pstnProvider: {
      uuid: string,
      apiImplementation: string,
    },
    pstnNumberInfo: {
      numbers: any,
      areaCode: {
        code: string,
      },
    },
    emergAddr: {  //TODO: remove this and use Address class
      streetAddress: string,
      unit: string,
      city: string,
      state: string,
      zip: string,
      uuid: string,
    },
    numbers: string,
    swivelNumbers: string[],
  };
  enabled: boolean;
  skipped: boolean;
}

interface ICustomScope extends ng.IScope {
  trialData?: ITrialData;
  trial?: any;
  $parent: ICustomScope;
}

export class PstnTrialSetupComponent implements ng.IComponentOptions {
  public controller = PstnTrialSetupCtrl;
  public template = require('modules/huron/pstn/pstnTrialSetup/pstnTrialSetup.html');
  public bindings = {
    dismiss: '&',
  };
}

export class PstnTrialSetupCtrl implements ng.IComponentController {
  public trialForm: ng.IFormController;
  public dismiss: Function;
  public trialData: ITrialData;
  public providerImplementation: string;
  public providerSelected: boolean;
  public invalidCount = 0;
  public SWIVEL: string;
  public parentTrialData;
  public trial: any;
  public addressLoading: boolean = false;
  public validation: boolean = false;
  public addressFound: boolean = false;
  public readOnly: boolean = false;

  public model: NumberModel = new NumberModel();
  public countryCode: string;

  public ftEnterpriseTrunking: boolean  = false;
  public ftLocation: boolean = false;

  /* @ngInject */
  constructor(private PstnModel: PstnModel,
              private TrialPstnService,
              private PstnService: PstnService,
              private Notification: Notification,
              private $q: ng.IQService,
              private $scope: ICustomScope,
              private $timeout: ng.ITimeoutService,
              private Analytics,
              private PstnAddressService: PstnAddressService, //Site and Location Based
              private $translate: ng.translate.ITranslateService,
              private HuronCompassService: HuronCompassService,
              private FeatureToggleService) {
    this.trialData = this.TrialPstnService.getData();
    this.SWIVEL = SWIVEL;
    this.parentTrialData = $scope.$parent.trialData;
    this.trial = $scope.$parent.trial;
  }

  public $onInit(): void {
    this.countryCode = this.PstnModel.getCountryCode();

    if (!_.isEmpty(this.trialData.details.emergAddr.state)) {
      this.validation = true;
      this.addressFound = true;
      this.addressLoading = false;
    }

    this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking).then(enabled => {
      this.ftEnterpriseTrunking = enabled;
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484).then((enabled) => {
      this.ftLocation = enabled;
    });
  }

  public onProviderChange(reset?): void {
    this.trialData.details.pstnProvider = this.PstnModel.getProvider();
    this.providerImplementation = this.trialData.details.pstnProvider.apiImplementation;
    this.resetNumberSearch(reset);
    this.providerSelected = true;
  }

  public onProviderReady(): void {
    const carriers = this.PstnModel.getCarriers();
    if (carriers.length === 1) {
      carriers[0].selected = true;
      this.PstnModel.setProvider(carriers[0]);
      this.onProviderChange();
    } else {
      carriers.forEach((pstnCarrier) => {
        if (pstnCarrier.selected) {
          this.PstnModel.setProvider(pstnCarrier);
          this.onProviderChange();
        }
      });
    }
  }

  public resetNumberSearch(reset): void {
    if (reset) {
      this.resetNumbers();
    }
  }

  public resetNumbers(): void {
    this.trialData.details.pstnNumberInfo.numbers = [];
    this.trialData.details.swivelNumbers = [];
    this.invalidCount = 0;
  }

  public searchCarrierInventory(value: string, block: boolean, quantity: number, consecutive: boolean, stateAbbreviation: string): void {
    this.model.paginateOptions.currentPage = 0;
    this.model.block = block;
    this.model.quantity = quantity;
    this.model.consecutive = consecutive;
    this.model.stateAbbreviation = stateAbbreviation;
    this.trialData.details.pstnNumberInfo.areaCode = {
      code: ('' + value).slice(0, MIN_VALID_CODE),
    };

    //Trial - ignore (block, quantity, consecutive)
    const params = {
      npa: this.trialData.details.pstnNumberInfo.areaCode.code,
      count: MAX_DID_QUANTITY,
      sequential: false,
      state: this.model.stateAbbreviation,
    };

    if (value.length === MAX_VALID_CODE) {
      params[NXX] = value.slice(MIN_VALID_CODE, value.length);
    } else {
      params[NXX] = null;
    }

    this.PstnService.searchCarrierInventory(this.trialData.details.pstnProvider.uuid, params)
      .then((numberRanges) => {
        this.model.searchResults = _.flatten(numberRanges);
        this.model.showNoResult = this.model.searchResults.length === 0;
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'trialModal.pstn.error.numbers');
      });
  }

  public addToCart(searchResultsModel): void {
    let reservation;
    const promises: any[] = [];
    _.forIn(searchResultsModel, (value, _key) => {
      if (value) {
        const key = _.parseInt(<string>_key);
        const searchResultsIndex = (this.model.paginateOptions.currentPage * this.model.paginateOptions.pageSize) + key;
        if (searchResultsIndex < this.model.searchResults.length && !this.trialData.details.pstnNumberInfo.numbers.includes(this.model.searchResults[searchResultsIndex])) {
          const numbers = this.model.searchResults[searchResultsIndex];
          reservation = this.PstnService.reserveCarrierInventoryV2(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), numbers, this.PstnModel.isCustomerExists());
          const promise = reservation
            .then((reservationData) => {
              const order = {
                data: {
                  numbers: numbers,
                },
                numberType: 'DID',
                orderType: 'NUMBER_ORDER',
                reservationId: reservationData.uuid,
              };
              this.trialData.details.pstnNumberInfo.numbers.push(order);
              // return the index to be used in the promise callback
              return {
                searchResultsIndex: searchResultsIndex,
                searchResultsModelIndex: key,
              };
            }).catch((response) => {
              this.Notification.errorResponse(response);
            });
          promises.push(promise);
        }
      }
    });

    this.$q.all(promises).finally(() => {
      this.model.addLoading = false;
      this.model.searchResults = [];
    });
  }

  private removeOrderFromCart(order): void {
    _.pull(this.trialData.details.pstnNumberInfo.numbers, order);
    this.model.searchMaxSelection = MAX_SEARCH_SELECTION - this.trialData.details.pstnNumberInfo.numbers.length;
  }

  public removeOrder(order): void {
    this.PstnService.releaseCarrierInventoryV2(this.PstnModel.getCustomerId(), order.reservationId, order.data.numbers, this.PstnModel.isCustomerExists())
        .then(_.partial(this.removeOrderFromCart.bind(this), order));
  }

  public manualTokenChange(tokens, invalidCount): void {
    this.trialData.details.swivelNumbers = tokens;
    this.invalidCount = invalidCount;
  }

  public skip(skipped): void {
    this.Analytics.trackTrialSteps(this.Analytics.eventNames.SKIP, this.parentTrialData);
    this.trialData.enabled = !skipped;
    this.trialData.skipped = skipped;
    this.$timeout(this.$scope.$parent.trial.nextStep);
  }

  private checkForInvalidTokens(): boolean {
    return this.invalidCount <= 0;
  }

  public disableNextButton(): boolean {
    if (!this.checkForInvalidTokens()) {
      // there are invalid tokens
      return true;
    } else if (this.providerSelected === true && this.providerImplementation === this.SWIVEL) {
      if (!this.ftEnterpriseTrunking) {
        return _.size(this.trialData.details.swivelNumbers) === 0;
      } else {
          // no swivel numbers needed
        return false;
      }
    } else if (this.providerSelected === true && this.providerImplementation !== this.SWIVEL && _.size(this.trialData.details.pstnNumberInfo.numbers) !== 0) {
      // PSTN numbers
      return false;
    } else if (this.providerSelected === true && this.providerImplementation !== this.SWIVEL && !this.addressFound) {
      return true;
    } else {
      // provider not selected or no valid numbers
      return true;
    }
  }

  public validateAddress(): void {
    this.addressLoading = true;
    this.validation = true;

    const address: Address = new Address();
    address.streetAddress = this.trialData.details.emergAddr.streetAddress;
    address.unit = this.trialData.details.emergAddr.unit;
    address.city = this.trialData.details.emergAddr.city;
    address.state = this.trialData.details.emergAddr.state;
    address.zip = this.trialData.details.emergAddr.zip;
    address.country = this.PstnModel.getCountryCode();
    this.PstnAddressService.lookup(this.trialData.details.pstnProvider.uuid, address)
    .then((_address: Address | null) => {
      if (_address) {
        this.addressFound = true;
        this.readOnly = true;
        _.extend(this.trialData.details.emergAddr, _address);
      } else {
        this.validation = false;
        this.Notification.error('trialModal.pstn.error.noAddress');
        this.Analytics.trackTrialSteps(this.Analytics.eventNames.VALIDATION_ERROR, this.parentTrialData, { value: this.trialData.details.emergAddr, error: this.$translate.instant('trialModal.pstn.error.noAddress') });
      }
    })
    .finally(() => {
      this.addressLoading = false;
    });
    return;
  }

  public resetAddress(): void {
    this.TrialPstnService.resetAddress();
    this.validation = false;
    this.addressFound = false;
    this.readOnly = false;
  }

  public previousStep(): void {
    if (!this.addressFound) {
      this.TrialPstnService.resetAddress();
    }
    this.trial.previousStep();
  }

  public dismissModal() {
    this.HuronCompassService.setIsCustomer(false);
    this.PstnModel.clear(this.ftLocation);
    this.dismiss();
  }

  public isDisabled(): boolean {
    if (this.providerImplementation === this.SWIVEL) {
      return this.disableNextButton();
    }
    return this.trialForm.$invalid || !this.addressFound || this.disableNextButton();
  }

}
