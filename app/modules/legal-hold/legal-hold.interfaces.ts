import { MatterState } from './legal-hold.enums';

export interface IMatterJsonData {
  orgId: string;
  createdBy: string;
  caseId: string;
  creationDate: Date;
  dateReleased?: Date;
  matterName: string;
  matterDescription: string;
  matterState?: MatterState;
  usersUUIDList?: string[];
}

export interface ICustodian {
  emailAddress: string;
  userId?: string;
  orgId?: string;
  firstName?: string;
  lastName?: string;
  error?: string;
}

export interface IMatterJsonDataForDisplay extends IMatterJsonData {
  createdByName: string | null;
  numberOfCustodians: number;
}

export interface IImportComponentApi {
  convertEmailsToUsers: Function;
  displayResults: Function;
}

export interface IUserUpdateResult {
  userListSize: number;
  failList: string[];
}

export interface IImportResult {
  success: ICustodian[];
  error: ICustodian[];
}
