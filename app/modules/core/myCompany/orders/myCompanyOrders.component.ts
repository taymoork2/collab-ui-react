import { IOrderDetail } from './myCompanyOrders.service';
import { Notification } from 'modules/core/notifications';
import { MyCompanyOrdersService } from './myCompanyOrders.service';

class MyCompanyOrdersCtrl implements ng.IComponentController {

  public gridOptions: uiGrid.IGridOptions;
  public loading: boolean = false;
  public logoutLoading: boolean = true;
  public orderDetailList: IOrderDetail[] = [];

  public digitalRiverOrderHistoryUrl: string;
  public digitalRiverLogoutUrl: string;

  /* @ngInject */
  constructor(
    private $translate: angular.translate.ITranslateService,
    private Notification: Notification,
    private MyCompanyOrdersService: MyCompanyOrdersService,
  ) {}

  public $onInit(): void {
    this.loading = true;
    this.initGridOptions();
    this.MyCompanyOrdersService.getOrderDetails().then(orderDetails => {
      this.orderDetailList = orderDetails;
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'myCompanyOrders.loadError');
    }).finally(() => {
      this.loading = false;
    });
  }

  private initGridOptions(): void {
    this.gridOptions = {
      data: '$ctrl.orderDetailList',
      multiSelect: false,
      rowHeight: 45,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 0,
      columnDefs: [{
        name: 'externalOrderId',
        displayName: this.$translate.instant('myCompanyOrders.numberHeader'),
        width: '17%',
      }, {
        name: 'productDescriptionList[0]',
        displayName: this.$translate.instant('myCompanyOrders.descriptionHeader'),
        width: '30%',
      }, {
        name: 'orderDate',
        displayName: this.$translate.instant('myCompanyOrders.dateHeader'),
        cellFilter: 'date',
        width: '17%',
      }, {
        name: 'status',
        displayName: this.$translate.instant('myCompanyOrders.statusHeader'),
        width: '17%',
      }, {
        name: 'total',
        displayName: this.$translate.instant('myCompanyOrders.priceHeader'),
        cellFilter: 'currency',
        width: '*',
      }],
    };
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
