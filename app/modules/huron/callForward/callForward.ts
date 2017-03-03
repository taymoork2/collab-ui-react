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

export class CallForwardBusy {
  public internalVoicemailEnabled: boolean | undefined;
  public internalDestination: string | null | undefined;
  public externalVoicemailEnabled: boolean | undefined;
  public externalDestination: string | null | undefined;
  public ringDurationTimer: number | undefined;

  constructor(obj: {
    internalVoicemailEnabled?: boolean,
    internalDestination?: string | null,
    externalVoicemailEnabled?: boolean,
    externalDestination?: string | null,
    ringDurationTimer?: number,
  } = {
    internalVoicemailEnabled: false,
    internalDestination: null,
    externalVoicemailEnabled: false,
    externalDestination: null,
    ringDurationTimer: 25,
  }) {
    this.internalVoicemailEnabled = obj.internalVoicemailEnabled;
    this.internalDestination = obj.internalDestination;
    this.externalVoicemailEnabled = obj.externalVoicemailEnabled;
    this.externalDestination = obj.externalDestination;
    this.ringDurationTimer = obj.ringDurationTimer;
  }
}

export class CallForward {
  public callForwardAll: CallForwardAll = new CallForwardAll();
  public callForwardBusy: CallForwardBusy = new CallForwardBusy();
  public callForwardNoAnswer: CallForwardBusy = new CallForwardBusy();
}
