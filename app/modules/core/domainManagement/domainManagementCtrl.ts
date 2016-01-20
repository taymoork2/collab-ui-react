namespace domainManagement {

  class DomainManagementCtrl {
    private _adminDomain;
    private _adminEmail;
    private _feature = false;

    /* @ngInject */
    constructor(private $state, Authinfo, CiService, private DomainManagementService, private FeatureToggleService) {

      FeatureToggleService.supports(FeatureToggleService.features.domainManagement)
        .then(dmEnabled => {
            if (dmEnabled) {
              this._feature = true;
            } else {
              this.$state.go('unauthorized');
            }
          }
        );

      CiService.getUser().then(curUser => {

        let myOrgId = Authinfo.getOrgId();

        if (curUser.managedOrgs && _.some(curUser.managedOrgs, {orgId: myOrgId})) {
          //Partner is logged on, skip verification test
          this._adminEmail = null;
          this._adminDomain = null;
        } else {
          this._adminEmail = curUser.userName;
          if (this._adminEmail) {
            this._adminDomain = this._adminEmail.split('@')[1];
          }
        }
      });
    }

    get domains() {
      return this.DomainManagementService.domainList;
    }

    get adminDomain() {
      return this._adminDomain;
    }

    delete(domain) {
      this.DomainManagementService.deleteDomain(domain);
    }

    get adminEmail() {
      return this._adminEmail;
    }

    get feature() {
      return this._feature;
    }
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
