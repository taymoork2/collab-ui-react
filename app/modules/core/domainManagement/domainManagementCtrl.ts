namespace domainManagement {

  class DomainManagementCtrl {

    private _loggedOnUser = {
      domain: null,
      email: null,
      isLoaded: false,
      isPartner: false
    };

    private _feature = false;

    /* @ngInject */
    constructor(Authinfo, CiService, private DomainManagementService, private FeatureToggleService) {

      FeatureToggleService.supports(FeatureToggleService.features.domainManagement)
        .then(dmEnabled => {
            this._feature = !!dmEnabled;
          }
        );

      CiService.getUser().then(curUser => {

        let myOrgId = Authinfo.getOrgId();

        if (curUser.managedOrgs && _.some(curUser.managedOrgs, {orgId: myOrgId})) {
          //Partner is logged on, skip verification test
          this._loggedOnUser.isPartner = true;
        } else {
          this._loggedOnUser.email = curUser.userName;
          if (this._loggedOnUser.email && this._loggedOnUser.email.indexOf('@') > 0) {
            this._loggedOnUser.domain = this._loggedOnUser.email.split('@')[1];
          }
        }

        this._loggedOnUser.isLoaded = true;
      });

      this.DomainManagementService.getVerifiedDomains();
    }

    get domains() {
      return this.DomainManagementService.domainList;
    }

    get loggedOnUser() {
      return this._loggedOnUser;
    }

    get feature() {
      return this._feature;
    }
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
