import { INumber } from './pgSetupAssistant/pgNumber/pgNumber.service';

export interface IPagingGroup extends ng.resource.IResource<IPagingGroup> {
  name: string;
  number: INumber;
}
