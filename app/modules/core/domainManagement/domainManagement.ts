namespace domainManagement {

  class DomainManagementCtrl {
    private _check = 'dd';
    private _adminDomain = 'example.com';
    private _domains = [
      {
        text: 'example.com',
        status: 'verified'
      },
      {
        text: 'sales.example.com',
        status: 'pending'
      }
    ];

    /* @ngInject */
    constructor(private $route) {
      let ctrl = this;
      ctrl._check = 'dde';
      console.log('domain ver');
    }

    get check() {
      return this._check;
    }

    get domains() {
      return this._domains;
    }
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
