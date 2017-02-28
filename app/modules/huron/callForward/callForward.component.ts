import { CallForward, CallForwardAll, CallForwardBusy } from './callForward';
import { HuronCustomerService } from 'modules/huron/customer/customer.service';

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}
const callForwardInputs = ['external', 'uri', 'custom'];
class CallForwardCtrl implements ng.IComponentController {
  public static ALL: string = 'all';
  public static BUSY: string = 'busy';
  public static NONE: string = 'none';
  public static VOICEMAIL: string = 'voicemail';

  public forwardState: string;
  public forwardExternalCalls: boolean = false;
  public forwardAllCalls: any;
  public forwardOptions: string[] = [];
  public voicemailEnabled: boolean;
  public callForward: CallForward;
  public onChangeFn: Function;
  public customTranslations: ITranslationMessages;
  public callDest: any;
  public callDestInternal: any;
  public callDestExternal: any;
  public voicemailAllEnabled: boolean = false;
  public internalVoicemailEnabled: boolean = false;
  public externalVoicemailEnabled: boolean = false;

 /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronCustomerService: HuronCustomerService,
    private TelephoneNumberService,
  ) {
    this.customTranslations = {
      placeholderText: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      helpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
    };
    this.forwardOptions = callForwardInputs;
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { callForward } = changes;

    if (callForward && callForward.currentValue) {
      this.processForwardOptionsChange(callForward);
      this.processCallForwardChanges(callForward);
    }
  }

  private processForwardOptionsChange(callForwardChanges: ng.IChangesObject) {
    if (callForwardChanges.currentValue.callForwardAll.destination) {
      this.addForwardOption(callForwardChanges.currentValue.callForwardAll.destination);
    }

    if (callForwardChanges.currentValue.callForwardBusy.internalDestination) {
      this.addForwardOption(callForwardChanges.currentValue.callForwardBusy.internalDestination);
    }

    if (callForwardChanges.currentValue.callForwardBusy.externalDestination) {
      this.addForwardOption(callForwardChanges.currentValue.callForwardBusy.externalDestination);
    }
  }

  private processCallForwardChanges(callForwardChanges: ng.IChangesObject) {
    if (callForwardChanges.currentValue.callForwardAll.destination || callForwardChanges.currentValue.callForwardAll.voicemailEnabled) {
      this.forwardState = CallForwardCtrl.ALL;
      this.voicemailAllEnabled = callForwardChanges.currentValue.callForwardAll.voicemailEnabled;
      if (callForwardChanges.currentValue.callForwardAll.destination) {
        this.forwardAllCalls = this.TelephoneNumberService.getDestinationObject(callForwardChanges.currentValue.callForwardAll.destination);
      }
    } else if (callForwardChanges.currentValue.callForwardBusy.internalDestination ||
                callForwardChanges.currentValue.callForwardBusy.internalVoicemailEnabled ||
                callForwardChanges.currentValue.callForwardBusy.externalDestination ||
                callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled) {
      this.forwardState = CallForwardCtrl.BUSY;
      if (callForwardChanges.currentValue.callForwardBusy.internalDestination) {
        this.callDestInternal = this.TelephoneNumberService.getDestinationObject(callForwardChanges.currentValue.callForwardBusy.internalDestination);
      }
      this.internalVoicemailEnabled = callForwardChanges.currentValue.callForwardBusy.internalVoicemailEnabled;
      if (callForwardChanges.currentValue.callForwardBusy.externalDestination ||
          callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled) {
        this.forwardExternalCalls = true;
        this.callDestExternal = this.TelephoneNumberService.getDestinationObject(callForwardChanges.currentValue.callForwardBusy.externalDestination);
        this.externalVoicemailEnabled = callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled;
      }
    } else {
      this.forwardState = CallForwardCtrl.NONE;
    }
  }

  private addForwardOption(value: string): void {
    if (!_.includes(this.forwardOptions, value)) {
      this.forwardOptions.push(value);
    }
  }

  public onCallFwdNoneChange(): void {
    this.change(new CallForward());
  }

  public onCallFwdAllChange(destination: any): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    callForwardAll.destination = (destination && destination.phoneNumber) ? this.validate(destination.phoneNumber) : null;
    this.callForward.callForwardAll = callForwardAll;
    this.callForward.callForwardBusy = new CallForwardBusy();
    this.change(this.callForward);
  }

  public onVoicemailAll(): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    callForwardAll.voicemailEnabled = this.voicemailAllEnabled;
    this.callForward.callForwardAll = callForwardAll;
    this.callForward.callForwardBusy = new CallForwardBusy();
    this.change(this.callForward);
  }

  public onCallFwdBusyChange(destination: any): void {
    let callForwardBusy: CallForwardBusy = new CallForwardBusy();
    callForwardBusy.internalDestination = (destination && destination.phoneNumber) ? this.validate(destination.phoneNumber) : null;
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onVoicemailBusy(): void {
    let callForwardBusy: CallForwardBusy = new CallForwardBusy();
    callForwardBusy.internalVoicemailEnabled = this.internalVoicemailEnabled;
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onCallFwdBusyExternalChange(destination: any): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    if (this.forwardExternalCalls) {
      callForwardBusy.externalDestination = (destination && destination.phoneNumber) ? this.validate(destination.phoneNumber) : null;
    } else {
      callForwardBusy.externalDestination = null;
      callForwardBusy.externalVoicemailEnabled = false;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onVoicemailBusyExternal(): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy); callForwardBusy.externalVoicemailEnabled = this.externalVoicemailEnabled;
    if (callForwardBusy.externalVoicemailEnabled) {
      callForwardBusy.externalDestination = null;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  private change(callForward: CallForward): void {
    this.onChangeFn({
      callForward: callForward,
    });
  }

  public getRegionCode() {
    return this.HuronCustomerService.getVoiceCustomer();
  }

  public validate(number: any) {
    let newNumber = number;
    if (number && this.TelephoneNumberService.validateDID(number)) {
      newNumber = this.TelephoneNumberService.getDIDValue(number);
    } else if (number.indexOf('@') === -1) {
      newNumber = _.replace(number, /-/g, '');
    }
    return newNumber.replace(/ /g, '');
  }

}

export class CallForwardComponent implements ng.IComponentOptions {
  public controller = CallForwardCtrl;
  public templateUrl = 'modules/huron/callForward/callForward.html';
  public bindings = {
    voicemailEnabled: '<',
    callForward: '<',
    onChangeFn: '&',
  };
}
