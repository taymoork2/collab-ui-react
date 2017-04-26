import { CmcUserData } from './cmcUserData';
import { IUser } from 'modules/core/auth/user/user';

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

  public setData(user: IUser, data: CmcUserData) {
    this.setMobileNumber(user, data.mobileNumber);
    this.setEntitlement(user);
    // TODO: Handler error properly
  }

  public getData(user: IUser): CmcUserData {
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

  private extractMobileNumber(user): any {
    if (user.phoneNumbers) {
      let nbr = _.find<any>(user.phoneNumbers, (nbr) => {
        return nbr.type === 'mobile';
      });
      return nbr !== undefined ? nbr.value : null;
    } else {
      return null;
    }
  }

  private extractCmcEntitlement(user: IUser): boolean {
    return _.includes(user.entitlements, 'cmc');
  }

  private setEntitlement(user: IUser) {

    //TODO: Add functionality
    let url = this.UrlConfig.getAdminServiceUrl() + 'organization/' + user.meta.organizationID + '/users/' + user.id + '/actions/onboardcmcuser/invoke';
    this.$http.post(url, {}).then( (res) => {
      this.$log.warn('cmcentitlement request result:', res);
    });
  }

  private updateUserData(user: IUser, userMobileData) {
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

  private setMobileNumber(user: IUser, number: string) {
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
