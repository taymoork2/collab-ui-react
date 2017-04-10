import { IOrderDetail } from './myCompanyOrders.service';
import { Notification } from 'modules/core/notifications';
import { MyCompanyOrdersService } from './myCompanyOrders.service';

const COMPLETED = 'COMPLETED';
const ERROR = 'ERROR';

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
      this.orderDetailList = _.map(orderDetails, (orderDetail: any) => {
        if (_.size(orderDetail.productDescriptionList) > 0) {
          orderDetail.productDescriptionList =
              this.formatProductDescriptionList(orderDetail.productDescriptionList);
        }
        if (COMPLETED === orderDetail.status) {
          orderDetail.status = this.$translate.instant('myCompanyOrders.completed');
        } else if (ERROR === orderDetail.status) {
          orderDetail.status = this.$translate.instant('myCompanyOrders.error');
        } else {
          orderDetail.status = this.$translate.instant('myCompanyOrders.pending');
        }
        return orderDetail;
      });
      // sort orders with newest in top
      this.orderDetailList.sort((a: IOrderDetail, b: IOrderDetail): number => {
        if (a.orderDate < b.orderDate) {
          return 1;
        } else {
          return 0;
        }
      });
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
        width: '14%',
      }, {
        name: 'productDescriptionList',
        displayName: this.$translate.instant('myCompanyOrders.descriptionHeader'),
        width: '45%',
      }, {
        name: 'orderDate',
        displayName: this.$translate.instant('myCompanyOrders.dateHeader'),
        cellFilter: 'date',
        width: '14%',
      }, {
        name: 'status',
        displayName: this.$translate.instant('myCompanyOrders.statusHeader'),
        width: '14%',
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
