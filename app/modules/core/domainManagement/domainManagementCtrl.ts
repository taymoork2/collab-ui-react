namespace domainManagement {

  class DomainManagementCtrl {
    private _adminDomain;
    private _adminEmail;
    private _feature = false;

    /* @ngInject */
    constructor(private $state, CiService, private DomainManagementService, private FeatureToggleService) {
      let ctrl = this;

      ctrl._feature = true;

      FeatureToggleService.supports(FeatureToggleService.features.domainManagement).then(function (dmEnabled) {
          if (dmEnabled) {
            ctrl._feature = true;
          } else {
            ctrl.$state.go('unauthorized');
          }
        }
      );

      CiService.getUser().then(function (curUser) {

        /*   var myOrgId = Authinfo.getOrgId();
         if (curUser.managedOrgs && _.some(curUser.managedOrgs, { orgId: myOrgId })) {
         console.log("domain man: My partner is here!");
         }*/

        ctrl._adminEmail = curUser.userName;
        if (ctrl._adminEmail) {
          ctrl._adminDomain = ctrl._adminEmail.split('@')[1];
        }
      });

      DomainManagementService.refreshDomainList().then(function () {
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
