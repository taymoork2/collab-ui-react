import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';
import { Notification } from 'modules/core/notifications';

class MyCompanyBillingCtrl implements ng.IComponentController {

  public loading: boolean = false;
  public logoutLoading: boolean = true;

  public digitalRiverBillingUrl: string;
  public digitalRiverLogoutUrl: string;

  /* @ngInject */
  constructor(
    private DigitalRiverService: DigitalRiverService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.initIframe();
  }

  private initIframe(): void {
    this.loading = true;
    this.DigitalRiverService.getBillingUrl().then((billingUrl) => {
      this.digitalRiverBillingUrl = billingUrl;
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'my-company.loadError');
      this.loading = false;
    });
  }
}

angular
  .module('Core')
  .component('myCompanyBilling', {
    template: require('modules/core/myCompany/billing/myCompanyBilling.tpl.html'),
    controller: MyCompanyBillingCtrl,
  });
