import { IOrderDetail, MyCompanyOrdersService } from './myCompanyOrders.service';

class MyCompanyOrdersCtrl {

  public gridOptions: uiGrid.IGridOptions;
  public loading: boolean = false;
  public orderDetailList: IOrderDetail[] = [];

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $templateCache: angular.ITemplateCacheService,
    private $translate: angular.translate.ITranslateService,
    private MyCompanyOrdersService: MyCompanyOrdersService,
    private Notification
  ) {}


  private $onInit(): void {
    this.initGridOptions();
    this.initData();
  }

  public downloadPdf(): void {
  }

  private initData(): void {
    this.loading = true;
    this.MyCompanyOrdersService.getOrderDetails().then(orderDetails => {
      this.orderDetailList = orderDetails;
    }).catch(response => {
      this.Notification.errorWithTrackingId(response, 'myCompanyOrders.loadError');
    }).finally(() => {
      this.loading = false;
    });
  }

  public formatProductDescriptionList(productDescriptionList: string[] = []): string {
    return productDescriptionList.join(', ');
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
      }, {
        name: 'productDescriptionList',
        cellTemplate: this.$templateCache.get<string>('modules/core/myCompany/orders/myCompanyOrdersDescription.tpl.html'),
        sortingAlgorithm: (a: string[], b: string[]) => {
          let firstA = _.get(a, '[0]', '').toLowerCase();
          let firstB = _.get(b, '[0]', '').toLowerCase();
          if (firstA > firstB) {
            return 1;
          } else if (firstA < firstB) {
            return -1;
          } else {
            return 0;
          }
        },
        displayName: this.$translate.instant('myCompanyOrders.descriptionHeader'),
      }, {
        name: 'total',
        cellFilter: 'currency',
        displayName: this.$translate.instant('myCompanyOrders.priceHeader'),
      }, {
        name: 'orderDate',
        displayName: this.$translate.instant('myCompanyOrders.dateHeader'),
        cellFilter: 'date',
      }, {
        name: 'actions',
        displayName: this.$translate.instant('myCompanyOrders.actionsHeader'),
        enableSorting: false,
        cellTemplate: this.$templateCache.get<string>('modules/core/myCompany/orders/myCompanyOrdersAction.tpl.html'),
      }]
    }
  }
}

angular
  .module('Core')
  .component('myCompanyOrders', {
    templateUrl: 'modules/core/myCompany/orders/myCompanyOrders.tpl.html',
    controller: MyCompanyOrdersCtrl,
  });
