export class CallForwardAll {
  public voicemailEnabled: boolean = false;
  public destination: string = '';
}

export class CallForwardBusy extends CallForwardAll {
  public intVoiceMailEnabled: boolean = false;
  public intDestination: string = '';
}