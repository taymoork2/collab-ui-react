import { INumber } from './pgNumber.service';

export interface IPagingGroup extends ng.resource.IResource<IPagingGroup> {
  name: string;
  number: INumber;
  uuid: string;
}
