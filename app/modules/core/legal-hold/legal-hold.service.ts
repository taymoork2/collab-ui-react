import { Matter } from './matter.model';
import { ICustodian, IImportResult, IMatterJsonData, IMatterJsonDataForDisplay } from './legal-hold.interfaces';
import { MatterState, CustodianImportErrors, Events } from './legal-hold.enums';

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
export enum GetUserBy {
  ID = 'id',
  EMAIL =  'email',
}

export class LegalHoldService {
  private adminServiceUrl: string;
  private shouldCancel = false;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config,
    private UrlConfig,
    private Userservice,
  ) {
    this.adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
  }

  private getActionUrl(action: Actions): string {
    return `https://retention-integration.wbx2.com/retention/api/v1/admin/onhold/matter?operationType=${action}`;
  }

  private getUserUrl(userEmailAddress: string): string {
    return `${this.adminServiceUrl}user?email=${encodeURIComponent(userEmailAddress)}`;
  }

  public createMatter(orgId: string, matterName: string, matterDescription: string, creationDate: Date, usersUUIDList: string[]): IPromise<Matter> {
    const data = {
      orgId: orgId,
      createdBy: this.Authinfo.getUserId(),
      creationDate: creationDate,
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

  public releaseMatter(matter: Matter, dateReleased: Date) {
    matter.releaseMatter(dateReleased);
    return this.$http.post(this.getActionUrl(Actions.UPDATE), matter.toJsonData());
  }

  public updateMatter(matter: Matter) {
    const fields = ['orgId', 'caseId', 'dateReleased', 'matterName', 'matterDescription', 'matterState'];
    let jsonMatter = matter.toJsonData();
    jsonMatter = _.pick(jsonMatter, fields);
    return this.$http.post(this.getActionUrl(Actions.UPDATE), jsonMatter);
  }

  public readMatter(orgId: string, caseId: string): IPromise<Matter> {
    const data = {
      orgId: orgId,
      caseId: caseId,
    };
    return this.$http.post(this.getActionUrl(Actions.READ), data).then(res => Matter.matterFromResponseData(<IMatterJsonData>res.data));
  }

  public deleteMatter(orgId: string, caseId: string) {
    const data = {
      orgId: orgId,
      caseId: caseId,
    };
    return this.$http.post(this.getActionUrl(Actions.DELETE), data);
  }

  public listMatters(orgId: string): IPromise<IMatterJsonDataForDisplay[]> {
    return this.$http.post(this.getActionUrl(Actions.LIST_MATTERS_FOR_ORG), { orgId: orgId })
      .then((response) => {
        const data = <IMatterJsonData[]>_.get(response, 'data.mattersAssociatedWithOrg');
        return this.massageMatterListForDisplay(data);
      });
  }

  public addUsersToMatter(orgId: string, caseId: string, usersUUIDList: string[]): IPromise<Matter> {
    const data = {
      orgId: orgId,
      caseId: caseId,
      usersUUIDList: usersUUIDList,
    };
    return this.$http.post(this.getActionUrl(Actions.ADD_USERS), data)
      .then(() => {
        return this.readMatter(orgId, caseId);
      })
      .catch((e) => {
        return e;
      });
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


  // this is a recursive function that processes emails one chunk at a time.
  // the reason for using recursion is to wait for the server call to complete
  // before sending additional data in order to avoid the server overload and
  // facilitate the cancelation as an alternative to recursion/polling

  public convertUsersChunk(csvEmailsOrIdsArray: string[][], getUserBy: GetUserBy, returnResult = {
    success: <ICustodian[]>[],
    error: <ICustodian[]>[],
  }): IPromise<IImportResult> {

    if (this.shouldCancel) {
      return this.$q.reject(`legalHold.custodianImport.${CustodianImportErrors.CANCELED}`);
    }
    // don't want to time out if this takes long
    this.$rootScope.$emit(this.Config.idleTabKeepAliveEvent);
    //create promise array out of the service calls for the chunk
    const getCustodiansInChunkPromiseArr = _.map(csvEmailsOrIdsArray[0], (user: string) => {
      return this.getCustodian(this.Authinfo.getOrgId(), getUserBy, user.trim())
        .then((result: ICustodian) => {
          if ((result).error) {
            returnResult.error.push(result);
          } else {
            returnResult.success.push(result);
          }
        })
        .catch((notFoundUser: ICustodian) => {
          returnResult.error.push(notFoundUser);
        });
    });
    return this.$q.all(getCustodiansInChunkPromiseArr).then(() => {
      this.$rootScope.$emit(Events.UPDATE_CONVERT_PROGRESS); //setUploadProgress();
      if (csvEmailsOrIdsArray.length > 1) {
        csvEmailsOrIdsArray.shift();
        return this.convertUsersChunk(csvEmailsOrIdsArray, getUserBy, returnResult);
      } else {
        return returnResult;
      }
    });
  }

  public cancelConvertUsers(): void {
    this.shouldCancel = true;
  }

  private getCustodianById(orgId: string, userId: string): ng.IPromise<ICustodian> {

    return this.Userservice.getUserAsPromise(userId)
      .then(response => {
        const user: ICustodian = {
          userId: userId,
          emailAddress: this.Userservice.getPrimaryEmailFromUser(response.data),
          firstName: _.get<string>(response, 'data.name.givenName', ''),
          lastName: _.get<string>(response, 'data.name.familyName', ''),
          orgId: orgId,
        };
        return user;
      })
      .catch(error => {
        const err = (_.get(error, 'status', '').toString() === '404') ? CustodianImportErrors.DIFF_ORG : CustodianImportErrors.UNKNOWN;
        const user = {
          emailAddress: userId,
          error: this.$translate.instant(`legalHold.custodianImport.${err}`),
        };
        return user;
      });
  }

  public getCustodianByEmailAddress(orgId: string, emailAddress: string): ng.IPromise<ICustodian> {
    return this.$http.get(this.getUserUrl(emailAddress))
      .then(response => {
        const user: ICustodian = {
          userId: _.get<string>(response, 'data.id', ''),
          emailAddress: emailAddress,
          firstName: _.get<string>(response, 'data.firstName', ''),
          lastName: _.get<string>(response, 'data.lastName', ''),
          orgId: orgId,
        };
        return user;
      })
      .catch(error => {
        const err = (_.get(error, 'status', '').toString() === '404') ? CustodianImportErrors.NOT_FOUND : CustodianImportErrors.UNKNOWN;
        const user: ICustodian = {
          emailAddress: emailAddress,
          error: this.$translate.instant(`legalHold.custodianImport.${err}`),
        };
        return this.$q.reject(user);
      });
  }


  public getCustodian(orgId: string, searchType: GetUserBy, queryParam: string): ng.IPromise<ICustodian> {

    if (searchType === GetUserBy.ID) {
      return this.getCustodianById(orgId, queryParam);
    } else {
      return this.getCustodianByEmailAddress(orgId, queryParam);
    }
  }

  private massageMatterListForDisplay(data: IMatterJsonData[]): IMatterJsonDataForDisplay[] {
    const result: IMatterJsonDataForDisplay[] = _.map(data, function (item) {
      const numOfUsers = _.get(item, 'usersAssociatedWithMatter', 0);
      return _.assign(item, { numberOfCustodians: numOfUsers, createdByName: null });
    });
    return result;
  }
}
