export class CallForwardAll {
  public voicemailEnabled: boolean | undefined;
  public destination: string | null | undefined;

  constructor(obj: {
    voicemailEnabled?: boolean,
    destination?: string | null,
  } = {
    destination: null,
    voicemailEnabled: false,
  }) {
    this.destination = obj.destination;
    this.voicemailEnabled = obj.voicemailEnabled;
  }
}

interface ICallForwardBusy {
  internalVoicemailEnabled?: boolean;
  internalDestination?: string | null;
  externalVoicemailEnabled?: boolean;
  externalDestination?: string | null;
  ringDurationTimer?: number;
}

export class CallForwardBusy implements ICallForwardBusy {
  public internalVoicemailEnabled: boolean | undefined;
  public internalDestination: string | null | undefined;
  public externalVoicemailEnabled: boolean | undefined;
  public externalDestination: string | null | undefined;
  public ringDurationTimer: number | undefined;

  constructor(callForwardBusy: ICallForwardBusy = {
    internalVoicemailEnabled: false,
    internalDestination: null,
    externalVoicemailEnabled: false,
    externalDestination: null,
    ringDurationTimer: 25,
  }) {
    this.internalVoicemailEnabled = callForwardBusy.internalVoicemailEnabled;
    this.internalDestination = callForwardBusy.internalDestination;
    this.externalVoicemailEnabled = callForwardBusy.externalVoicemailEnabled;
    this.externalDestination = callForwardBusy.externalDestination;
    this.ringDurationTimer = callForwardBusy.ringDurationTimer;
  }
}

export class CallForward {
  public callForwardAll: CallForwardAll = new CallForwardAll();
  public callForwardBusy: CallForwardBusy = new CallForwardBusy();
  public callForwardNoAnswer: CallForwardBusy = new CallForwardBusy();
}
