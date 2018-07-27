import { Matter } from './matter.model';
import { ICustodian, IImportResult, IMatterJsonData, IMatterJsonDataForDisplay, IUserUpdateResult } from './legal-hold.interfaces';
import { MatterState, CustodianErrors, Events, ImportMode } from './legal-hold.enums';

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
  EMAIL = 'email',
}

export enum OperationObject {
  USERS = 'users',
  MATTER = 'matter',
}

export class LegalHoldService {
  private adminServiceUrl: string;
  private shouldCancel = false;
  private retentionUrl: string;

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
    this.retentionUrl = this.UrlConfig.getRetentionUrl();
  }

  private getActionUrl(action: Actions, operationObject: OperationObject = OperationObject.MATTER): string {
    return `${this.retentionUrl}admin/onhold/${operationObject}?operationType=${action}`;
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
    return this.$http.post<IMatterJsonData>(this.getActionUrl(Actions.READ), data).then(res => Matter.matterFromResponseData(res.data));
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

  public addUsersToMatter(orgId: string, caseId: string, usersUUIDList: string[]): IPromise<IUserUpdateResult> {
    const data = {
      orgId: orgId,
      caseId: caseId,
      usersUUIDList: usersUUIDList,
    };
    //TODO algendel 7/10: remove readMatter once back end is updated to return new user count and failed UUIDs list

    return this.readMatter(orgId, caseId)
      .then((matter) => {
        return this.$http.post(this.getActionUrl(Actions.ADD_USERS, OperationObject.USERS), data)
          .then((updateResult) => {
            return this.getInfoFromUserUpdate(ImportMode.ADD, usersUUIDList, orgId, caseId, updateResult.data, matter.userList);
          });
      });
  }

  public removeUsersFromMatter(orgId: string, caseId: string, usersUUIDList: string[]): IPromise<IUserUpdateResult> {
    const data = {
      orgId: orgId,
      caseId: caseId,
      usersUUIDList: usersUUIDList,
    };
    return this.$http.post(this.getActionUrl(Actions.REMOVE_USERS, OperationObject.USERS), data)
      .then((updateResult) => {
        //TODO algendel 7/10: remove the call once back end is updated to return new user count and failed UUIDs list
        return this.getInfoFromUserUpdate(ImportMode.REMOVE, usersUUIDList, orgId, caseId, updateResult.data );
      });
  }

  //algendel 7/10: this whole function should go away once the back end is modified to return the list of failed UUIDs and new number of users in matter
  private getInfoFromUserUpdate(operation: ImportMode, usersUUIDList: string[], orgId: string, caseId: string, response: Object, usersInMatterBeforeUpdate: string[] = []): IPromise<IUserUpdateResult> {
    return this.readMatter(orgId, caseId)
      .then((matter) => {
        const usersInMatter = _.isArray(matter.userList) ? matter.userList.length : 0;
        let failList: string[] = [];
        if (operation === ImportMode.ADD) {
          const usersAddedToMatter = _.difference(matter.userList || [], usersInMatterBeforeUpdate);
          failList = _.difference(usersUUIDList, usersAddedToMatter);
        } else {
          failList = _.difference(usersUUIDList, _.get(response, 'usersRemovedFromMatter', []));
        }
        return {
          failList: failList,
          userListSize: usersInMatter,
        };
      });
  }

  public listUsersInMatter(orgId: string, caseId: string): IPromise<string[]> {
    const data = {
      orgId: orgId,
      caseId: caseId,
    };
    return (this.$http.post(this.getActionUrl(Actions.LIST_USERS, OperationObject.USERS), data))
      .then(result => {
        return _.get<string[]>(result, 'data.usersInMatter', []);
      });
  }

  public listMatterIdsForUser(orgId: string, userUUID: string): IPromise<string[]> {
    const data = {
      orgId: orgId,
      userUUID: userUUID,
    };
    return this.$http.post(this.getActionUrl(Actions.LIST_MATTERS_FOR_USER, OperationObject.USERS), data)
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
      this.shouldCancel = false;
      return this.$q.reject(`legalHold.custodianImport.${CustodianErrors.CANCELED}`);
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
      this.$rootScope.$emit(Events.CONVERSION_CHUNK_PROCESSED); //setUploadProgress();
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
        const err = (_.get(error, 'status', '').toString() === '404') ? CustodianErrors.DIFF_ORG : CustodianErrors.UNKNOWN;
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
        const err = (_.get(error, 'status', '').toString() === '404') ? CustodianErrors.NOT_FOUND : CustodianErrors.UNKNOWN;
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
    }
    return this.getCustodianByEmailAddress(orgId, queryParam);
  }

  private massageMatterListForDisplay(data: IMatterJsonData[]): IMatterJsonDataForDisplay[] {
    const result: IMatterJsonDataForDisplay[] = _.map(data, function (item) {
      const numOfUsers = _.get(item, 'usersAssociatedWithMatter', 0);
      return _.assign(item, { numberOfCustodians: numOfUsers, createdByName: null });
    });
    return result;
  }
}