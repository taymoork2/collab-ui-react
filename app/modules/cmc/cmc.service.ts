import { ICmcUserData, ICmcOrgStatusResponse, ICmcUserStatusResponse, ICmcUser, ICmcIssue } from './cmc.interface';

export class CmcService {

  //private cmcUrl: string = 'http://localhost:8082/cmc-controller-service-server/api/v1';
  private cmcUrl: string = 'https://cmc-controller.intb1.ciscospark.com/api/v1';
  private useMock: boolean = false;

  private timeout: number = 5000; // ms

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Orgservice,
    private Config,
    private UrlConfig,
    private CmcServiceMock,
    private $http: ng.IHttpService,
    private $translate,
    private $timeout: ng.ITimeoutService,
  ) {
  }

  public setUserData(user: ICmcUser, data: ICmcUserData): ng.IPromise<any> {
    let mobileNumberSet: ng.IPromise<any> = this.setMobileNumber(user, data.mobileNumber);
    let entitlementSet: ng.IPromise<any> = this.setEntitlement(user, data.entitled);
    return this.$q.all(
      [
        mobileNumberSet,
        entitlementSet,
      ],
    );
  }

  public getUserData(user: ICmcUser): ICmcUserData {
    this.$log.info('Getting data for user=', user);
    let entitled = this.hasCmcEntitlement(user);
    let mobileNumber = this.extractMobileNumber(user);
    return <ICmcUserData> {
      mobileNumber: mobileNumber,
      entitled: entitled,
    };
  }

  // TODO: Find out when cmc settings should be unavailable...
  public allowCmcSettings(orgId: string): ng.IPromise<boolean> {
    // based on org entitlements ?
    let deferred = this.$q.defer();
    this.Orgservice.getOrg((data, success) => {
      this.$log.debug('data', data);
      if (success) {
        if (data.success) {
          deferred.resolve(this.hasCmcService(data.services));
          this.$log.debug('org data:', data);
        } else {
          deferred.reject(data);
        }
      } else {
        deferred.resolve(false);
        this.$log.debug('data', data);
      }
    }, orgId, {
      basicInfo: true,
    });
    return deferred.promise;
  }

  // TODO Adapt to cmc status call
  public preCheckOrg(orgId: string): ng.IPromise<ICmcOrgStatusResponse> {
    if (!this.useMock) {
      //let deferred: ng.IDeferred<any> = this.$q.defer();
      //this.requestTimeout(deferred);
      let url: string = this.cmcUrl + `/organizations/${orgId}/status`;
      return this.$http.get(url, { timeout: this.requestTimeout() }).then((response) => {
        return response.data;
      });
    } else {
      return this.CmcServiceMock.mockOrgStatus(orgId);
    }
  }

  private requestTimeout(): ng.IPromise<any> {
    let deferred: ng.IDeferred<any> = this.$q.defer();
    this.$timeout(() => {
      deferred.resolve();
    }, this.timeout);
    return deferred.promise;
  }

  // TODO Preliminary poor mans user precheck
  //      which only checks call aware entitlement.
  //      It's wrapped in a promise to make it easier
  //      to replace by CI or CMC requests
  public preCheckUser(user: ICmcUser): ng.IPromise<ICmcUserStatusResponse> {
    let status: string = this.hasCallAwareEntitlement(user) ? 'ok' : 'error';
    let issues: ICmcIssue[] = [];
    if (status === 'error') {
      issues.push({
        code: 5000, // TODO: Define 'official' code
        message: 'User is not entitled for call aware', // TODO: Translation
      });
    }

    let res: ICmcUserStatusResponse = {
      status: status,
      issues: issues,
    };
    return this.$q.resolve(res);
  }

  private hasCmcService(services: string[]): boolean {
    return !!_.find(services, (service) => {
      return service === this.Config.entitlements.cmc;
    });
  }

  private extractMobileNumber(user: ICmcUser): any {
    if (user.phoneNumbers) {
      let nbr = _.find<any>(user.phoneNumbers, (nbr) => {
        return nbr.type === 'mobile';
      });
      return nbr !== undefined ? nbr.value : null;
    } else {
      return null;
    }
  }

  private hasCmcEntitlement(user: ICmcUser): boolean {
    return _.includes(user.entitlements, this.Config.entitlements.cmc);
  }

  private hasCallAwareEntitlement(user: ICmcUser): boolean {
    return _.includes(user.entitlements, this.Config.entitlements.fusion_uc); //'squared-fusion-uc');
  }

  private setEntitlement(user: ICmcUser, entitle: boolean): IPromise<any> {
    let url = this.UrlConfig.getAdminServiceUrl() + 'organization/' + user.meta.organizationID + '/users/' + user.id + '/actions/onboardcmcuser/invoke';
    //let url = 'http://localhost:8080/atlas-server/admin/api/v1/' + 'organization/' + user.meta.organizationID + '/users/' + user.id + '/actions/onboardcmcuser/invoke';
    if (!entitle) {
      url += '?removeEntitlement=true';
    }
    this.$log.info('Updating cmc entitlement using url:', url);
    return this.$http.post(url, {});
  }

  private setMobileNumber(user: ICmcUser, number: string): IPromise<any>  {
    return this.checkUniqueMobileNumber(user, number).then((existingUsername) => {
      if (existingUsername && user.userName !== existingUsername) {
        return this.$q.reject({
          data: {
            message: `${number} ` + this.$translate.instant('cmc.failures.alreadyRegisteredForAtLeastOneMoreUser') + ' ' + existingUsername,
          },
        });
      } else {
        return this.patchNumber(user, number);
      }
    });
  }

  public patchNumber(user: ICmcUser, number: string): IPromise<any> {
    let userMobileData = {
      schemas: this.Config.scimSchemas,
      phoneNumbers: [
        {
          type: 'mobile',
          value: number,
        },
      ],
    };

    let scimUrl = this.UrlConfig.getScimUrl(user.meta.organizationID) + '/' + user.id;
    this.$log.info('Updating user', user);
    this.$log.info('User data', userMobileData);
    return this.$http({
      method: 'PATCH',
      url: scimUrl,
      data: userMobileData,
    });
  }

  private checkUniqueMobileNumber(user: ICmcUser, mobileNbr: string): IPromise<String> {
    let filter: string = `phoneNumbers[type eq \"mobile\" and value eq \"${mobileNbr}\"]`;
    let scimUrl: string = this.UrlConfig.getScimUrl(user.meta.organizationID) + '?filter=' + filter;
    return this.$http.get(scimUrl).then((response: any) => {
      if (response.data.Resources.length > 0) {
        return response.data.Resources[0].userName;
      } else {
        return null;
      }
    });
  }

}
