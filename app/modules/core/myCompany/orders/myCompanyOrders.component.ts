import { IOrderDetail } from './myCompanyOrders.service';
import { DigitalRiverService } from '../../../online/digitalRiver/digitalRiver.service';

class MyCompanyOrdersCtrl implements ng.IComponentController {

  public gridOptions: uiGrid.IGridOptions;
  public loading: boolean = false;
  public logoutLoading: boolean = true;
  public orderDetailList: IOrderDetail[] = [];

  public digitalRiverOrderHistoryUrl: string;
  public digitalRiverLogoutUrl: string;

  /* @ngInject */
  constructor(
    private DigitalRiverService: DigitalRiverService,
    private Notification,
  ) {}

  public $onInit(): void {
    // TODO restore initData and initGridOptions from history when iframe is removed
    this.initIframe();
  }

  private initIframe(): void {
    this.loading = true;
    this.DigitalRiverService.getOrderHistoryUrl().then((orderHistoryUrl) => {
      this.digitalRiverOrderHistoryUrl = orderHistoryUrl;
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'myCompanyOrders.loadError');
      this.loading = false;
    });
  }

  public downloadPdf(): void {
  }

  public formatProductDescriptionList(productDescriptionList: string[] = []): string {
    return productDescriptionList.join(', ');
  }
}

angular
  .module('Core')
  .component('myCompanyOrders', {
    templateUrl: 'modules/core/myCompany/orders/myCompanyOrders.tpl.html',
    controller: MyCompanyOrdersCtrl,
  });
