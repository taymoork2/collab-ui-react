export class DateObj {
  public dateVal: string;
  public timeVal: string;
  constructor (obj: {
    dateVal: string;
    timeVal: string;
  }) {
    this.dateVal = obj.dateVal;
    this.timeVal = obj.timeVal;
  }
}
