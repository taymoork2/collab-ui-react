import {
  Address, PstnCarrier, PstnModel, PstnAddressService, PstnService,
} from 'modules/huron/pstn';
import { IOption } from 'modules/huron/dialing';
import { Notification } from 'modules/core/notifications';
import { NumberService, NumberType, NumberOrder } from 'modules/huron/numbers';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

export class CallEmergencyServicesComponent implements ng.IComponentOptions {
  public controller = CallEmergencyServicesCtrl;
  public template = require('modules/call/shared/call-emergency-services/call-emergency-services.html');
  public bindings = {
    number: '=',        //IOption: Model for select - emergency callback number (ECBN)
    numberOptions: '<', //IOptions []: Options for select - ECBN
    address: '=',       //Address: Model for emergency service address (ESA)
    required: '<',      //boolean: Is the component required
    isPstnSetup: '<',   //boolean: that will allow ESA to be Entered and Validated
    allowEcbnSetup: '<', //boolean: that will allow ECBN to be setup
    ecbnChangeFn: '&',   //Notification function when ECBN is changed
  };
}

class CallEmergencyServicesCtrl implements ng.IComponentController {
  //Input binding properties
  public number: IOption;
  public numberOptions: IOption[];
  public address: Address;
  public required: boolean;
  public isPstnSetup: boolean;
  public allowEcbnSetup: boolean;
  public ecbnChangeFn: Function;
  //Class properties
  public addressValidating: boolean = false;
  public addressReadOnly: boolean = false;
  public selectHolder: string = '';
  public inputHolder: string = '';
  public emergencyCallbackNumberForm: ng.IFormController;
  public emergencyServiceAddressForm: ng.IFormController;
  public onNumberFilterFn: Function;
  public isNumberDisabled: boolean = false;

  //To be used by the HTML Template as constants
  public ECBN_OK: number = 0;
  public ECBN_NO_NUMBERS: number = 1;
  public ECBN_NOT_SELECTED: number = 2;
  public ECBN_MISSING_ASSIGN: number = 3;
  public stateECBN: number = this.ECBN_OK;

  /* @ngInject */
  public constructor (
    private $translate: ng.translate.ITranslateService,
    private PstnModel: PstnModel,
    private PstnService: PstnService,
    private PstnAddressService: PstnAddressService,
    private Notification: Notification,
    private NumberService: NumberService,
    private PhoneNumberService: PhoneNumberService,
  ) {
  }

  public $onInit(): void {
    this.selectHolder = this.$translate.instant('common.selectNumber');

    if (!_.isArray(this.numberOptions)) {
      this.numberOptions = [];
    }
    if (!_.isBoolean(this.required)) {
      this.required = true;
    }
    if (!_.isBoolean(this.allowEcbnSetup)) {
      this.allowEcbnSetup = false;
    }

    if (!_.isEmpty(this.PstnModel.getCustomerId())) {
      if (_.isEmpty(this.PstnModel.getProviderId())) {
        this.PstnService.listCustomerCarriers(this.PstnModel.getCustomerId()).then(carriers => {
          if (_.isArray(carriers) && carriers.length > 0) {
            this.PstnModel.setProvider(_.get<PstnCarrier>(carriers, '[0]'));
          }
        });
      }
    }
    //Set at Init time
    //The reason is the this.numberOptions will change because
    //of the html cs-select refresh function
    this.isNumberDisabled = this.getIsNumberDisabled();
    if (this.isNumberDisabled) {
      this.stateECBN = this.ECBN_NO_NUMBERS;
      if (this.number && !_.isEmpty(this.number.value)) {
        this.stateECBN = this.ECBN_MISSING_ASSIGN;
      }
    } else {
      this.stateECBN = this.ECBN_NOT_SELECTED;
    }
    //Test for ECBN_MISSING_ASSIGN
    this.showNumberMessage();
  }

  private getIsNumberDisabled(): boolean {
    let disabled: boolean = false;
    if (!this.allowEcbnSetup) {
      disabled = true;
    } else if (_.isEmpty(this.numberOptions)) {
      disabled = true;
    }
    return disabled;
  }

  public showES(): boolean {
    return this.isPstnSetup;
  }

  public showNumberMessage(): boolean {
    if (!this.allowEcbnSetup) {
      return false;
    }
    if (!this.number) {
      return true;
    }
    if (!_.isString(this.number.value)) {
      return true;
    }
    if (_.isEmpty(this.number.value)) {
      return true;
    }
    if (_.isEmpty(this.numberOptions)) {
      return true;
    }
    //Find the number in the numberOptions
    const options = this.numberOptions.filter(option => {
      return option.value === this.number.value;
    });
    if (_.isEmpty(options)) {
      this.stateECBN = this.ECBN_MISSING_ASSIGN;
      return true;
    }
    return false;
  }

  public isNumberRequired(): boolean {
    return this.required && this.allowEcbnSetup && !this.isNumberDisabled;
  }

  public onValidateAddress(): void {
    this.addressValidating = true;
    if (this.address) {
      if (this.address.country && this.address.country.length === 0) {
        this.address.country = this.PstnModel.getCountryCode();
      }
      this.PstnAddressService.lookup(this.PstnModel.getProviderId(), this.address)
        .then((address: Address) => {
          if (address) {
            this.address = address;
          } else {
            this.Notification.error('pstnSetup.serviceAddressNotFound');
          }
        })
        .catch(error => this.Notification.errorResponse(error))
        .finally(() => {
          this.addressValidating = false;
        });
    }
  }

  public onEcbnChange(value: any): void {
    if (!_.isEmpty(value)) {
      if (this.ecbnChangeFn) {
        this.ecbnChangeFn({
          value: value,
        });
      }
    }
  }

  public onResetAddress(): void {
    this.address.reset();
    this.address.country = this.PstnModel.getCountryCode();
    if (this.emergencyServiceAddressForm) {
      this.emergencyServiceAddressForm.$setPristine();
      this.emergencyServiceAddressForm.$setUntouched();
    }
  }

  public getEmegencyCallBackNumbers(filter) {
    if (_.isString(filter)) {
      this.NumberService.getNumberList(filter, NumberType.EXTERNAL, true, NumberOrder.DESCENDING).then((numberList) => {
        this.numberOptions = _.map(numberList, number => {
          return {
            value: number.external,
            label: this.PhoneNumberService.getNationalFormat(number.external),
          } as IOption;
        });
      });
    }
  }

}
