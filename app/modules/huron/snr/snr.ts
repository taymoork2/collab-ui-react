export interface IBaseSingleNumberReach {
  uuid?: string;
  destination?: string;
  answerTooLateTimer?: string;
  patterns?: Patterns;
}

export interface IRSingleNumberReach extends IBaseSingleNumberReach {
  enableMobileConnect?: string;
}

export interface ISingleNumberReach extends IBaseSingleNumberReach {
  enableMobileConnect: boolean;
}

export class SingleNumberReach implements ISingleNumberReach {
  public uuid?: string;
  public destination?: string;
  public answerTooLateTimer?: string;
  public enableMobileConnect: boolean;
  public patterns?: Patterns;

  constructor(singleNumberReach: IRSingleNumberReach = {
    uuid: undefined,
    destination: undefined,
    answerTooLateTimer: undefined,
    enableMobileConnect: undefined,
    patterns: undefined,
  }) {
    this.uuid = singleNumberReach.uuid;
    this.destination = singleNumberReach.destination;
    this.answerTooLateTimer = singleNumberReach.answerTooLateTimer;
    this.enableMobileConnect = (singleNumberReach.enableMobileConnect === 'true');
    this.patterns = new Patterns(_.get(singleNumberReach, 'patterns'));
  }
}

export interface IPatterns {
  pattern: string[];
}

export class Patterns implements IPatterns {
  public pattern: string[];

  constructor(patterns: IPatterns = {
    pattern: [],
  }) {
    this.pattern = patterns.pattern;
  }
}
