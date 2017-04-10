export interface ISingleNumberReach {
  destination: string;
  answerTooLateTimer: string;
  enableMobileConnect: string;
}
export class SingleNumberReach {
  public destination: string | undefined | null;
  public answerTooLateTimer: string | undefined | null;
  public enableMobileConnect: string | undefined | null;
  constructor(obj: {
    destination?: string | null,
    answerTooLateTimer?: string | null,
    enableMobileConnect?: string | null,
  } = {
    destination: null,
    answerTooLateTimer: null,
    enableMobileConnect: null,
  }) {
    this.destination = obj.destination;
    this.answerTooLateTimer = obj.answerTooLateTimer;
    this.enableMobileConnect = obj.enableMobileConnect;
  }
}
