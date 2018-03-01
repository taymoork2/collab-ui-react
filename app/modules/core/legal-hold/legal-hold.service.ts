import { Matter } from './matter.model';
import { ICustodian, IMatterJsonData } from './legal-hold.interfaces';
import { MatterState } from './legal-hold.enums';
export enum Actions {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST_MATTERS_FOR_ORG = 'ListMattersForOrg',
  ADD_USERS = 'AddUsersToMatter',
  REMOVE_USERS = 'RemoveUsersFromMatter',
  LIST_USERS = 'ReadUsersInMatter',
  LIST_MATTERS_FOR_USER = 'ListMattersForUser',
}

export class LegalHoldService {
  private adminServiceUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
  }

  private getActionUrl(action: Actions): string {
    return `${this.adminServiceUrl}retention/api/v1/admin/onhold/matter?operationType=${action}`;
  }

  private getUserUrl(userEmailAddress: string): string {
    return `${this.adminServiceUrl}user?email=${encodeURIComponent(userEmailAddress)}`;
  }

  public createMatter(orgId: string, matterName: string, matterDescription: string, creationDate: Date, usersUUIDList: string[]): IPromise<Matter> {
    const data = {
      orgId: orgId,
      createdBy: this.Authinfo.getUserId(),
      creationDate: creationDate,
      releaseDate: undefined,
      matterName: matterName,
      matterDescription: matterDescription,
      matterState: MatterState.ACTIVE,
      usersUUIDList: usersUUIDList,
    };

    return this.$http.post(this.getActionUrl(Actions.CREATE), data)
      .then((response) => {
        const caseId = <string>_.get(response.data, 'caseId');
        const createdMatter: IMatterJsonData = _.assignIn(data, { caseId: caseId });
        return Matter.matterFromResponseData(createdMatter);
      });
  }

  public releaseMatter(matter: Matter, releaseDate: Date) {
    matter.releaseMatter(releaseDate);
    return this.$http.post(this.getActionUrl(Actions.UPDATE), matter.toJsonData());
  }

  public readMatter(orgId: string, caseId: string): IPromise<Matter> {
    return this.$http.get(this.getActionUrl(Actions.READ), {
      params: {
        orgId: orgId,
        caseId: caseId,
      },
    }).then(res => Matter.matterFromResponseData(<IMatterJsonData>res.data));
  }

  public deleteMatter(orgId: string, caseId: string) {
    const data = {
      orgId: orgId,
      caseId: caseId,
    };
    return this.$http.post(this.getActionUrl(Actions.DELETE), data);
  }

  public listMatters(orgId: string): IPromise<IMatterJsonData[]> {
    return this.$http.post(this.getActionUrl(Actions.LIST_MATTERS_FOR_ORG), { orgId: orgId })
      .then(response => <IMatterJsonData[]>response.data);
  }

  public addUsersToMatter(orgId: string, caseId: string, usersUUIDList: string[]): IPromise<Matter> {
    const data = {
      orgId: orgId,
      caseId: caseId,
      usersUUIDList: usersUUIDList,
    };
    return this.$http.post(this.getActionUrl(Actions.ADD_USERS), data)
      .then(() => this.readMatter(orgId, caseId));
  }

  public removeUsersFromMatter(orgId: string, caseId: string, usersUUIDList: string[]): IPromise<Matter> {
    const data = {
      orgId: orgId,
      caseId: caseId,
      usersUUIDList: usersUUIDList,
    };
    return this.$http.post(this.getActionUrl(Actions.REMOVE_USERS), data)
      .then(() => this.readMatter(orgId, caseId));
  }

  public listUsersInMatter(orgId: string, caseId: string): IPromise<string[]> {
    const data = {
      orgId: orgId,
      caseId: caseId,
    };
    return (this.$http.post(this.getActionUrl(Actions.LIST_USERS), data))
      .then(result => <string[]>result.data);
  }

  public listMatterIdsForUser(orgId: string, userUUID: string): IPromise<string[]> {
    const data = {
      orgId: orgId,
      userUUID: userUUID,
    };
    return this.$http.post(this.getActionUrl(Actions.LIST_MATTERS_FOR_USER), data)
      .then(result => <string[]>result.data);
  }

  public getCustodian(emailAddress: string): ng.IPromise<ICustodian> {
    return this.$http.get(this.getUserUrl(emailAddress))
      .then(response => {
        const result: ICustodian = {
          userId: _.get<string>(response, 'data.id', ''),
          firstName: _.get<string>(response, 'data.firstName', ''),
          lastName: _.get<string>(response, 'data.lastName', ''),
        };
        return result;
      });
  }
}
