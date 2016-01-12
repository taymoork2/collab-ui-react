namespace domainManagement {

  class DomainManagementCtrl {
    private _check = 'dd';
    private _adminDomain = {
      text: 'example.com',
      status: 'verified'
    }
    private _domains = [
      {
        text: 'example.com',
        status: 'verified'
      },
      {
        text: 'sales.example.com',
        status: 'pending'
      },
      {
        text: 'meet.example.com',
        status: 'pending'
      },
      {
        text: 'go.example.com',
        status: 'pending'
      }
    ];

    /* @ngInject */
    constructor(private $route, Auth, Authinfo, DomainManagementService) {
      let ctrl = this;
      ctrl._check = 'dde';

    /*
    How to get admin account e-mail:
     Auth.getAccount(Authinfo.getOrgId()).then(function (arg1) {

        console.log('domain ver getAccount:', arg1.data.accounts[0].customerAdminEmail);
        let emaildomain = arg1.data.accounts[0].customerAdminEmail.split('@')[1];
        console.log('domain ver emaildomain::', emaildomain);
      });*/

      ctrl._domains = DomainManagementService.domainList;

      DomainManagementService.refreshDomainList();
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
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
