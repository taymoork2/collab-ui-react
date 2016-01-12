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

    get adminDomain() {
      return this._adminDomain;
    }
  }
  angular
    .module('Core')
    .controller('DomainManagementCtrl', DomainManagementCtrl);
}
