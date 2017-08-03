require('./_myCompany.scss');

class MyCompanyPageCtrl {

  private _tabs: Object[];

  get tabs() {
    return this._tabs;
  }

  /* @ngInject */
  constructor(
    private Authinfo,
    private $translate: ng.translate.ITranslateService,
  ) {
    this._tabs = [{
      title: this.$translate.instant('my-company.subscription'),
      state: 'my-company.subscriptions',
    }, {
      title: this.$translate.instant('my-company.info'),
      state: 'my-company.info',
    }];

    const customers = this.Authinfo.getCustomerAccounts();
    const result = _.some(customers, { customerType: 'Online' });
    if (result) {
      this._tabs.push({
        title: this.$translate.instant('my-company.order'),
        state: 'my-company.orders',
      });
    }
  }
}

angular
  .module('Core')
  .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
