import { SWIVEL, MIN_VALID_CODE, MAX_VALID_CODE, NXX, MAX_DID_QUANTITY } from '../pstn.const';
import { Notification } from '../../../core/notifications/notification.service';
import { PaginateOptions } from '../paging-option.model';
import { PstnService } from '../pstn.service';
import { PstnModel } from '../pstn.model';
import { HuronCompassService } from '../../compass/compass.service';

export class PstnTrialSetupComponent implements ng.IComponentOptions {
  public controller = PstnTrialSetupCtrl;
  public templateUrl = 'modules/huron/pstn/pstnTrialSetup/pstnTrialSetup.html';
  public bindings = {
    dismiss: '&',
  };
}

export class PstnTrialSetupCtrl implements ng.IComponentController {
  public trialData: any;
  public providerImplementation: string;
  public providerSelected: boolean;
  public invalidCount = 0;
  public SWIVEL: string;
  public searchResults: Array<any>;
  public paginateOptions = new PaginateOptions();
  public showNoResult: boolean;
  public maxSelection = 10;
  public addLoading: boolean;
  public parentTrialData;
  public trial: any;
  public addressLoading: boolean = false;
  public validation: boolean = false;
  public addressFound: boolean = false;
  public readOnly: boolean = false;
  public dismiss: Function;

  /* @ngInject */
  constructor(private PstnModel: PstnModel,
              private TrialPstnService,
              private PstnService: PstnService,
              private Notification: Notification,
              private $q: ng.IQService,
              private $scope: ng.IScope,
              private $timeout: ng.ITimeoutService,
              private Analytics,
              private PstnServiceAddressService,
              private $translate: ng.translate.ITranslateService,
              private HuronCompassService: HuronCompassService) {
    this.trialData = this.TrialPstnService.getData();
    this.SWIVEL = SWIVEL;
    this.parentTrialData = $scope.$parent.trialData;
    this.trial = $scope.$parent.trial;
  }

  public $onInit(): void {
    if (!_.isEmpty(this.trialData.details.emergAddr.state)) {
      this.validation = true;
      this.addressFound = true;
      this.addressLoading = false;
    }
  }

  public onProviderChange(reset?): void {
    this.trialData.details.pstnProvider = this.PstnModel.getProvider();
    this.providerImplementation = this.trialData.details.pstnProvider.apiImplementation;
    this.resetNumberSearch(reset);
    this.providerSelected = true;
  }

  public onProviderReady(): void {
    let carriers = this.PstnModel.getCarriers();
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

  public searchCarrierInventory(value): void {
    this.paginateOptions.currentPage = 0;
    this.trialData.details.pstnNumberInfo.areaCode = {
      code: ('' + value).slice(0, MIN_VALID_CODE),
    };

    let params = {
      npa: this.trialData.details.pstnNumberInfo.areaCode.code,
      count: MAX_DID_QUANTITY,
      sequential: false,
    };

    if (value.length === MAX_VALID_CODE) {
      params[NXX] = value.slice(MIN_VALID_CODE, value.length);
    } else {
      params[NXX] = null;
    }

    this.PstnService.searchCarrierInventory(this.trialData.details.pstnProvider.uuid, params)
      .then((numberRanges) => {
        this.searchResults = _.flatten(numberRanges);
        this.showNoResult = this.searchResults.length === 0;
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'trialModal.pstn.error.numbers');
      });
  }

  public addToCart(searchResultsModel): void {
    let reservation;
    let promises: Array<any> = [];
    _.forIn(searchResultsModel, (value, _key) => {
      if (value) {
        let key = _.parseInt(<string>_key);
        let searchResultsIndex = (this.paginateOptions.currentPage * this.paginateOptions.pageSize) + key;
        if (searchResultsIndex < this.searchResults.length && !this.trialData.details.pstnNumberInfo.numbers.includes(this.searchResults[searchResultsIndex])) {
          let numbers = this.searchResults[searchResultsIndex];
          reservation = this.PstnService.reserveCarrierInventoryV2(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), numbers, this.PstnModel.isCustomerExists());
          let promise = reservation
            .then((reservationData) => {
              let order = {
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
      this.addLoading = false;
      // check if we need to decrement current page
      if (this.paginateOptions.currentPage >= this.paginateOptions.numberOfPages(this.searchResults)) {
        this.paginateOptions.currentPage--;
      }
      this.maxSelection = 10 - this.trialData.details.pstnNumberInfo.numbers.length;
      this.searchResults = [];
    });
  }

  private removeOrderFromCart(order): void {
    _.pull(this.trialData.details.pstnNumberInfo.numbers, order);
    this.maxSelection = 10 - this.trialData.details.pstnNumberInfo.numbers.length;
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
    } else if (this.providerImplementation === this.SWIVEL && _.size(this.trialData.details.swivelNumbers) === 0) {
      // no swivel numbers entered
      return true;
    } else if (this.providerImplementation !== this.SWIVEL && _.size(this.trialData.details.pstnNumberInfo.numbers) === 0) {
      // no PSTN numbers
      return true;
    } else if (this.providerImplementation !== this.SWIVEL && !this.addressFound) {
      return true;
    } else {
      // have some valid numbers
      return false;
    }
  }

  public validateAddress(): void {
    this.addressLoading = true;
    this.validation = true;
    return this.PstnServiceAddressService.lookupAddressV2({
      streetAddress: this.trialData.details.emergAddr.streetAddress,
      unit: this.trialData.details.emergAddr.unit,
      city: this.trialData.details.emergAddr.city,
      state: this.trialData.details.emergAddr.state,
      zip: this.trialData.details.emergAddr.zip,
    }, this.trialData.details.pstnProvider.uuid)
      .then(response => {
        if (!_.isUndefined(response)) {
          this.addressFound = true;
          this.readOnly = true;
          _.extend(this.trialData.details.emergAddr, response);
        } else {
          this.validation = false;
          this.Notification.error('trialModal.pstn.error.noAddress');
          this.Analytics.trackTrialSteps(this.Analytics.eventNames.VALIDATION_ERROR, this.parentTrialData, { value: this.trialData.details.emergAddr, error: this.$translate.instant('trialModal.pstn.error.noAddress') });
        }
      })
      .finally(() => {
        this.addressLoading = false;
      });
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
    this.PstnModel.clear();
    this.dismiss();
  }

}
