require('./_myCompany.scss');
import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';

class MyCompanyPageCtrl {

  private _tabs: Object[];

  get tabs() {
    return this._tabs;
  }

  /* @ngInject */
  constructor(
    private Authinfo,
    private DigitalRiverService: DigitalRiverService,
    private FeatureToggleService,
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
    const isOnline = _.some(customers, { customerType: 'Online' });
    if (isOnline) {
      this._tabs.push({
        title: this.$translate.instant('my-company.order'),
        state: 'my-company.orders',
      });
      const subscriptions = this.Authinfo.getSubscriptions();
      const hasPaidOrders = _.some(subscriptions, { orderingTool: 'DIGITAL_RIVER' });
      if (hasPaidOrders) {
        this.FeatureToggleService.atlasMyCompanyBillingTabGetStatus().then((toggle) => {
          if (toggle) {
            this._tabs.push({
              title: this.$translate.instant('my-company.billing'),
              state: 'my-company.billing',
            });
          }
        });
      }
      // create cookie for Digital River
      this.DigitalRiverService.getDigitalRiverToken();
    }
  }
}

angular
  .module('Core')
  .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
