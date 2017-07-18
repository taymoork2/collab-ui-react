import { IOption } from './../dialing/dialing.service';
export interface ICallerID {
  externalCallerIdType: IOption;
  customCallerIdName: string;
  customCallerIdNumber: string;
}

export class CallerID implements ICallerID {
  public externalCallerIdType;
  public customCallerIdName;
  public customCallerIdNumber;
}
