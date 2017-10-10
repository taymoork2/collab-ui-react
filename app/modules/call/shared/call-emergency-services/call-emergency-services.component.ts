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
    allowEcnSetup: '<', //boolean: that will allow ECN to be setup
  };
}

class CallEmergencyServicesCtrl implements ng.IComponentController {
  //Input binding properties
  public number: IOption;
  public numberOptions: IOption[];
  public address: Address;
  public required: boolean;
  public isPstnSetup: boolean;
  public allowEcnSetup: boolean;
  //Class properties
  public addressValidating: boolean = false;
  public addressReadOnly: boolean = false;
  public selectHolder: string = '';
  public inputHolder: string = '';
  public emergencyCallbackNumberForm: ng.IFormController;
  public emergencyServiceAddressForm: ng.IFormController;
  public onNumberFilterFn: Function;

  /* @ngInject */
  public constructor (
    private PstnModel: PstnModel,
    private PstnService: PstnService,
    private PstnAddressService: PstnAddressService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
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
    if (!_.isBoolean(this.allowEcnSetup)) {
      this.allowEcnSetup = false;
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
  }

  public showES() {
    return this.isPstnSetup;
  }

  public isNumberRequired() {
    return this.required && this.allowEcnSetup;
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

  public onResetAddress(): void {
    this.address.reset();
    this.address.country = this.PstnModel.getCountryCode();
    if (this.emergencyServiceAddressForm) {
      this.emergencyServiceAddressForm.$setPristine();
      this.emergencyServiceAddressForm.$setUntouched();
    }
  }

  public getEmegencyCallBackNumbers(filter) {
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
