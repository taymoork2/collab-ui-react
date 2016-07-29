namespace myCompanyPage {

  export interface IOrderDetail {
    number: string,
    description: string,
    price: string,
    date: Date,
  }

  class MyCompanyOrdersCtrl {

    public orderDetailList: IOrderDetail[] = [];
    public gridOptions: uiGrid.IGridOptions;

    /* @ngInject */
    constructor(
      private $templateCache: angular.ITemplateCacheService,
      private $translate: angular.translate.ITranslateService,
      private MyCompanyOrdersService: MyCompanyOrdersService
    ) {}

    public downloadPdf(): void {
    }

    private $onInit(): void {
      this.initGridOptions();
      this.MyCompanyOrdersService.getOrderDetails().then(orderDetails => {
        this.orderDetailList = orderDetails;
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
          name: 'number',
          displayName: this.$translate.instant('myCompanyOrders.numberHeader'),
        }, {
          name: 'description',
          displayName: this.$translate.instant('myCompanyOrders.descriptionHeader'),
        }, {
          name: 'price',
          displayName: this.$translate.instant('myCompanyOrders.priceHeader'),
        }, {
          name: 'date',
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
}
