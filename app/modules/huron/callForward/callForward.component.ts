import {
  CallForwardAll,
  CallForwardBusy
} from './callForward';

class CallForward {
  static ALL: string = 'all';
  static BUSY: string = 'busy';
  static NONE: string = 'none';
  static VOICEMAIL: string = 'voicemail';

  public forwardState: string;
  public forwardExternalCalls: boolean = false;
  public forwardAllCalls: string = '';
  public forwardNABCalls: string = '';
  public forwardExternalNABCalls: string = '';
  public forwardOptions: string[] = [];

  public voicemailEnabled: boolean;
  public callForwardAll: CallForwardAll;
  public callForwardBusy: CallForwardBusy;
  public onChangeFn: Function;

  private $onInit(): void {
    this.initForwardOptions();
    this.initCallForward();
  }

  private initForwardOptions(): void {
    if (this.voicemailEnabled) {
      this.forwardOptions.push('Voicemail');
    }

    if (this.callForwardAll.destination) {
      this.forwardOptions.push(this.callForwardAll.destination);
    }

    if (this.callForwardBusy.intDestination) {
      this.forwardOptions.push(this.callForwardBusy.intDestination);
    }

    if (this.callForwardBusy.destination) {
      this.forwardOptions.push(this.callForwardBusy.destination);
    }
  }

  private initCallForward(): void {
    if (this.callForwardAll.destination || this.callForwardAll.voicemailEnabled) {
      this.forwardState = CallForward.ALL;
      this.forwardAllCalls = this.callForwardAll.voicemailEnabled ? _.capitalize(CallForward.VOICEMAIL) : this.callForwardAll.destination;
    } else if (this.callForwardBusy.intDestination ||
                this.callForwardBusy.intVoiceMailEnabled ||
                this.callForwardBusy.destination ||
                this.callForwardBusy.voicemailEnabled) {
      this.forwardState = CallForward.BUSY;
      this.forwardNABCalls = this.callForwardBusy.intVoiceMailEnabled ? _.capitalize(CallForward.VOICEMAIL) : this.callForwardBusy.intDestination;
      if (this.callForwardBusy.destination ||
          this.callForwardBusy.voicemailEnabled) {
        this.forwardExternalCalls = true;
        this.forwardExternalNABCalls = this.callForwardBusy.voicemailEnabled ? _.capitalize(CallForward.VOICEMAIL) : this.callForwardBusy.destination;
      }
    } else {
      this.forwardState = CallForward.NONE;
    }
  }

  public onCallFwdNoneChange(): void {
    this.change(new CallForwardAll(), new CallForwardBusy());
  }

  public onCallFwdAllChange(destination: string): void {
    let callForwardAll: CallForwardAll = new CallForwardAll();
    if (this.forwardAllCalls.toLowerCase() === CallForward.VOICEMAIL) {
      callForwardAll.voicemailEnabled = true;
    } else {
      callForwardAll.destination = destination;
    }
    this.change(callForwardAll , new CallForwardBusy());
  }

  public onCallFwdBusyChange(destination: string): void {
    let callForwardBusy: CallForwardBusy = new CallForwardBusy();
    if (this.forwardNABCalls.toLowerCase() === CallForward.VOICEMAIL) {
      callForwardBusy.intVoiceMailEnabled = true;
    } else {
      callForwardBusy.intDestination = destination;
    }
    this.change(new CallForwardAll(), callForwardBusy);
  }

  public onCallFwdBusyExternal(destination: string): void {
    let callForwardBusy: CallForwardBusy = new CallForwardBusy();
    if (this.forwardExternalNABCalls.toLowerCase() === CallForward.VOICEMAIL) {
      callForwardBusy.voicemailEnabled = true;
    } else {
      callForwardBusy.destination = destination;
    }
    this.change(new CallForwardAll(), callForwardBusy);
  }

  private change(callForwardAll: CallForwardAll, callForwardBusy: CallForwardBusy): void {
    this.onChangeFn({
      callForwardAll: callForwardAll,
      callForwardBusy: callForwardBusy
    })
  }
}

export class CallForwardComponent implements ng.IComponentOptions {
  public controller = CallForward;
  public templateUrl = 'modules/huron/callForward/callForward.html';
  public bindings: {[binding: string]: string} = {
    voicemailEnabled: '<',
    callForwardAll: '<',
    callForwardBusy: '<',
    onChangeFn: '&'
  };
}
