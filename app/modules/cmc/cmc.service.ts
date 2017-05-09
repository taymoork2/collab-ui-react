import { CmcUserData } from './cmcUserData';
import { ICmcUser } from './cmcUser.interface';

export class CmcService {

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Orgservice,
    private Config,
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {
  }

  public setData(user: ICmcUser, data: CmcUserData) {
    this.setMobileNumber(user, data.mobileNumber);
    this.setEntitlement(user, data.entitled);
    // TODO: Handler error properly
  }

  public getData(user: ICmcUser): CmcUserData {
    this.$log.warn('Getting data for user=', user);
    let entitled = this.extractCmcEntitlement(user);
    let mobileNumber = this.extractMobileNumber(user);
    return new CmcUserData(mobileNumber, entitled);
  }

  // TODO: Find out when cmc settings should be unavailable...
  public allowCmcSettings(orgId: string) {
    // based on org entitlements ?
    let deferred = this.$q.defer();
    this.Orgservice.getOrg((data, success) => {
      if (success) {
        deferred.resolve(true);
        this.$log.debug('org data:', data);
      } else {
        deferred.resolve(false);
      }
    }, orgId, {
      basicInfo: true,
    });
    return deferred.promise;
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

  private extractCmcEntitlement(user: ICmcUser): boolean {
    return _.includes(user.entitlements, 'cmc');
  }

  private setEntitlement(user: ICmcUser, entitle: boolean) {

    let url = this.UrlConfig.getAdminServiceUrl() + 'organization/' + user.meta.organizationID + '/users/' + user.id + '/actions/onboardcmcuser/invoke';
    //let url = 'http://localhost:8080/atlas-server/admin/api/v1/' + 'organization/' + user.meta.organizationID + '/users/' + user.id + '/actions/onboardcmcuser/invoke';
    if (!entitle) {
      url += '?removeEntitlement=true';
    }
    this.$log.info('Updating cmc entitlement using url:', url);
    this.$http.post(url, {})
      .then((res) => {
        this.$log.info('cmc entitlement request result:', res);
      })
      .catch((error) => {
        this.$log.warn('cmc entitlement request failed:', error);
      });
  }

  private updateUserData(user: ICmcUser, userMobileData) {
    let scimUrl = this.UrlConfig.getScimUrl(user.meta.organizationID) + '/' + user.id;
    this.$log.info('Updating user', user);
    this.$log.info('User data', userMobileData);
    this.$log.info('Using scim url:', scimUrl);
    return this.$http({
      method: 'PATCH',
      url: scimUrl,
      data: userMobileData,
    });
  }

  private setMobileNumber(user: ICmcUser, number: string) {
    let userMobileData = {
      schemas: this.Config.scimSchemas,
      phoneNumbers: [
        {
          type: 'mobile',
          value: number,
        },
      ],
    };

    return this.updateUserData(user, userMobileData)
      .then((res) => {
        this.$log.info('User updated with new data:', res);
      })
      .catch((error) => {
        // TODO: what to do when mobile number update fails
        this.$log.warn('Update user failed:', error);
      });
  }
}
