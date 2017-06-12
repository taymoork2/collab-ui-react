export class FallbackDestination {
  public number?: string | null;
  public numberUuid?: string | null;
  public name?: string | null;
  public memberUuid?: string | null;
  public sendToVoicemail: boolean;
  public timer?: number | null;

  constructor(obj: {
    number?: string | null,
    numberUuid?: string | null,
    name?: string | null,
    memberUuid?: string | null,
    sendToVoicemail: boolean,
    timer?: number | null,
  } = {
    number: null,
    numberUuid: null,
    name: null,
    memberUuid: null,
    sendToVoicemail: false,
    timer: null,
  }) {
    this.number = obj.number;
    this.numberUuid = obj.numberUuid;
    this.name = obj.name;
    this.memberUuid = obj.memberUuid;
    this.sendToVoicemail = obj.sendToVoicemail;
    this.timer = obj.timer;
  }
}
