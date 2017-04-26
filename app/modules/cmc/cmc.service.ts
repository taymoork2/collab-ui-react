import { CmcUserData } from './cmcUserData';


class CmcUser {
  public id;
  public cmcUserData;
}

export class CmcService {

  private existingCmcUsers: CmcUser[];

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Orgservice,
  ) {
    this.existingCmcUsers = new Array();
  }

  // TODO: Replace by proper backend call when available...
  public setData(id, data: CmcUserData) {
    this.$log.warn('Setting data ', data, ',id=', id);
    let existingUser = _.find(this.existingCmcUsers, { id: id });
    this.$log.warn('existing user', existingUser);
    if (existingUser) {
      this.$log.warn('Found and updating existing user = ', existingUser);
      existingUser.cmcUserData.entitled = data.entitled;
      existingUser.cmcUserData.mobileNumber = data.mobileNumber;
    } else {
      this.$log.warn('User ', id , 'not found...');
    }
  }

  // TODO: Replace by proper backend call when available...
  //       Currently just create a user when reading nonexisting
  public getData(id): CmcUserData {
    this.$log.warn('Getting data for id=', id);
    let existingUser = _.find(this.existingCmcUsers, { id: id });
    if (existingUser) {
      this.$log.warn('Found and returning existing user');
      return existingUser.cmcUserData;
    } else {
      let newUser = new CmcUser();
      newUser.id = id;
      newUser.cmcUserData = new CmcUserData('', false);
      this.existingCmcUsers.push(newUser);
      this.$log.warn('Returned new user ', newUser, ', there are now ', this.existingCmcUsers.length, ' users');
      return newUser.cmcUserData;
    }
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
}
