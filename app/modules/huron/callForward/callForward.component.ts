import { CallForward, CallForwardAll, CallForwardBusy } from './callForward';

class CallForwardCtrl implements ng.IComponentController {
  public static ALL: string = 'all';
  public static BUSY: string = 'busy';
  public static NONE: string = 'none';
  public static VOICEMAIL: string = 'voicemail';

  public forwardState: string;
  public forwardExternalCalls: boolean = false;
  public forwardAllCalls: string = '';
  public forwardNABCalls: string = '';
  public forwardExternalNABCalls: string = '';
  public forwardOptions: string[] = [];

  public voicemailEnabled: boolean;
  public callForward: CallForward;
  public onChangeFn: Function;

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let callForwardChanges = changes['callForward'];
    let voicemailEnabledChanges = changes['voicemailEnabled'];

    if (voicemailEnabledChanges && voicemailEnabledChanges.currentValue) {
      this.forwardOptions.push('Voicemail');
    }

    if (callForwardChanges && callForwardChanges.currentValue) {
      this.processForwardOptionsChange(callForwardChanges);
      this.processCallForwardChanges(callForwardChanges);
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
      this.forwardAllCalls = callForwardChanges.currentValue.callForwardAll.voicemailEnabled ? _.capitalize(CallForwardCtrl.VOICEMAIL) : callForwardChanges.currentValue.callForwardAll.destination;
    } else if (callForwardChanges.currentValue.callForwardBusy.internalDestination ||
                callForwardChanges.currentValue.callForwardBusy.internalVoicemailEnabled ||
                callForwardChanges.currentValue.callForwardBusy.externalDestination ||
                callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled) {
      this.forwardState = CallForwardCtrl.BUSY;
      this.forwardNABCalls = callForwardChanges.currentValue.callForwardBusy.internalVoicemailEnabled ? _.capitalize(CallForwardCtrl.VOICEMAIL) : callForwardChanges.currentValue.callForwardBusy.internalDestination;
      if (callForwardChanges.currentValue.callForwardBusy.externalDestination ||
          callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled) {
        this.forwardExternalCalls = true;
        this.forwardExternalNABCalls = callForwardChanges.currentValue.callForwardBusy.externalVoicemailEnabled ? _.capitalize(CallForwardCtrl.VOICEMAIL) : callForwardChanges.currentValue.callForwardBusy.externalDestination;
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

  public onCallFwdAllChange(destination: string): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    if (this.forwardAllCalls.toLowerCase() === CallForwardCtrl.VOICEMAIL) {
      callForwardAll.voicemailEnabled = true;
      callForwardAll.destination = null;
    } else {
      callForwardAll.destination = (destination) ? destination : this.forwardAllCalls;
    }
    this.callForward.callForwardAll = callForwardAll;
    this.callForward.callForwardBusy = new CallForwardBusy();

    this.change(this.callForward);
  }

  public onCallFwdBusyChange(destination: string): void {
    let callForwardBusy: CallForwardBusy = new CallForwardBusy();
    if (this.forwardNABCalls.toLowerCase() === CallForwardCtrl.VOICEMAIL) {
      callForwardBusy.internalVoicemailEnabled = true;
      callForwardBusy.internalDestination = null;
    } else {
      callForwardBusy.internalDestination = (destination) ? destination : this.forwardNABCalls;
    }
    this.callForward.callForwardAll = new CallForwardAll();
    this.callForward.callForwardBusy = callForwardBusy;
    this.change(this.callForward);
  }

  public onCallFwdBusyExternal(destination: string): void {
    let callForwardBusy: CallForwardBusy = _.cloneDeep(this.callForward.callForwardBusy);
    if (this.forwardExternalCalls) {
      if (this.forwardExternalNABCalls.toLowerCase() === CallForwardCtrl.VOICEMAIL) {
        callForwardBusy.externalVoicemailEnabled = true;
        callForwardBusy.externalDestination = null;
      } else {
        callForwardBusy.externalVoicemailEnabled = false;
        callForwardBusy.externalDestination = (destination) ? destination : this.forwardExternalNABCalls;
      }
    } else {
      callForwardBusy.externalVoicemailEnabled = false;
      callForwardBusy.externalDestination = null;
    }
    this.callForward.callForwardBusy = callForwardBusy;
    this.callForward.callForwardAll = new CallForwardAll();
    this.change(this.callForward);
  }

  private change(callForward: CallForward): void {
    this.onChangeFn({
      callForward: callForward,
    });
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
