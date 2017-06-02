import { CmcUserData } from './cmcUserData';
import { ICmcUser } from './cmcUser.interface';
import { ICmcOrgStatusResponse } from './cmc.interface';
import { ICmcUserStatusResponse } from './cmc.interface';
import { ICmcIssue } from './cmc.interface';
export class CmcService {

  private dockerUrl: string = 'http://localhost:8082/cmc-controller-service-server/api/v1';
  private useDocker: boolean = false;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Orgservice,
    private Config,
    private UrlConfig,
    private CmcServiceMock,
    private $http: ng.IHttpService,
  ) {
  }

  public setUserData(user: ICmcUser, data: CmcUserData): ng.IPromise<any> {
    let mobileNumberSet: ng.IPromise<any> = this.setMobileNumber(user, data.mobileNumber);
    let entitlementSet: ng.IPromise<any> = this.setEntitlement(user, data.entitled);
    return this.$q.all(
      [
        mobileNumberSet,
        entitlementSet,
      ],
    );
  }

  public getUserData(user: ICmcUser): CmcUserData {
    this.$log.info('Getting data for user=', user);
    let entitled = this.hasCmcEntitlement(user);
    let mobileNumber = this.extractMobileNumber(user);
    return new CmcUserData(mobileNumber, entitled);
  }

  // TODO: Find out when cmc settings should be unavailable...
  public allowCmcSettings(orgId: string): ng.IPromise<boolean> {
    // based on org entitlements ?
    let deferred = this.$q.defer();
    this.Orgservice.getOrg((data, success) => {
      if (success) {
        deferred.resolve(this.hasCmcService(data.services));
        this.$log.debug('org data:', data);
      } else {
        deferred.resolve(false);
      }
    }, orgId, {
      basicInfo: true,
    });
    return deferred.promise;
  }

  // TODO Adapt to cmc status call
  public preCheckOrg(orgId: string): ng.IPromise<ICmcOrgStatusResponse> {
    if (this.useDocker) {
      let url: string = this.dockerUrl + `/organizations/${orgId}/status`;
      return this.$http.get(url).then((response) => {
        return response.data;
      });
    } else {
      return this.CmcServiceMock.mockOrgStatus(orgId);
    }
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

    let res = {
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
    return this.checkUniqueMobileNumber(user, number).then((unique) => {
      if (!unique) {
        return this.$q.reject({
          data: {
            message: `${number} is not unique`,
          },
        });
      } else {
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
    });
    /*
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
    */

  }

  private checkUniqueMobileNumber(user: ICmcUser, mobileNbr: string): IPromise<any> {
    let filter: string = `phoneNumbers[type eq \"mobile\" and value eq \"${mobileNbr}\"]`;
    let scimUrl: string = this.UrlConfig.getScimUrl(user.meta.organizationID) + '?filter=' + filter;
    return this.$http.get(scimUrl).then((response: any) => {
      return response.data.Resources.length === 0;
    });
  }

}
