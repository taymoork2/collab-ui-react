namespace domainManagement {

  class DomainManagementCtrl {
    private _check = 'dd';
    private _adminDomain;
    private _adminEmail;
    private _domains = [
    ];

    /* @ngInject */
    constructor(private $route, Auth, Authinfo, private DomainManagementService) {
      let ctrl = this;
      ctrl._check = 'dde';

      DomainManagementService.refreshDomainList().then( function() {

        if (!ctrl.DomainManagementService.domainList || ctrl.DomainManagementService.domainList.length == 0){
          //no domain has been verified before!

          //demand we find admin before we show the list:

          Auth.getAccount(Authinfo.getOrgId()).then(function (arg1) {
            ctrl._adminEmail = arg1.data.accounts[0].customerAdminEmail;
            ctrl._adminDomain = ctrl._adminEmail.split('@')[1];
            ctrl._domains = ctrl.DomainManagementService.domainList;
          });

        } else {
          //domains already added, we don't need admin's e-mail to continue.
          ctrl._domains = ctrl.DomainManagementService.domainList;

          Auth.getAccount(Authinfo.getOrgId()).then(function (arg1) {
            ctrl._adminEmail = arg1.data.accounts[0].customerAdminEmail;
            ctrl._adminDomain = ctrl._adminEmail.split('@')[1];
          });
        }
      });
    }

    get check() {
      return this._check;
    }

    get domains() {
      return this._domains;
    }

    get adminDomain() {
      return this._adminDomain;
    }

    delete(domain) {
      this.DomainManagementService.deleteDomain(domain);
    }
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
