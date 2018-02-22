import { MatterState } from './legal-hold.enum';

export interface IMatterJsonData {
  orgId: string;
  createdBy: string;
  caseId: string;
  creationDate: Date;
  releaseDate?: Date | null;
  matterName: string;
  matterDescription: string;
  matterState?: MatterState;
  usersUUIDList?: string[];
}

export interface ICustodian {
  userId: string;
  firstName: string;
  lastName: string;

}

