import { IOption } from './../dialing/dialing.service';
export interface ICallerID {
  externalCallerIdType: IOption;
  customCallerIdName: string;
  customCallerIdNumber: string;
}
