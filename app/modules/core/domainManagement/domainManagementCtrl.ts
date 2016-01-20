namespace domainManagement {

  class DomainManagementCtrl {
    private _adminDomain;
    private _adminEmail;
    private _feature = false;

    /* @ngInject */
    constructor(private $state, CiService, private DomainManagementService, private FeatureToggleService) {


      this._feature = true;

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

        /*   var myOrgId = Authinfo.getOrgId();
         if (curUser.managedOrgs && _.some(curUser.managedOrgs, { orgId: myOrgId })) {
         console.log("domain man: My partner is here!");
         }*/

        this._adminEmail = curUser.userName;
        if (this._adminEmail) {
          this._adminDomain = this._adminEmail.split('@')[1];
        }
      });

      DomainManagementService.refreshDomainList().then(() => {
        // ctrl._domains = ctrl.DomainManagementService.domainList
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
