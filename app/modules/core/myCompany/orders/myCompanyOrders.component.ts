import { Analytics } from 'modules/core/analytics';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { Config } from 'modules/core/config/config';
import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';
import { IOrderDetail } from './myCompanyOrders.service';
import { Notification } from 'modules/core/notifications';
import { MyCompanyOrdersService } from './myCompanyOrders.service';

enum OrderStatus {
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}
enum OrderType {
  ONLINE_SPARK = 'A-SPK-M',
  ONLINE_WEBEX = '-ONL-',
  TRIAL = 'Trial',
  FREE = 'Free',
}

class MyCompanyOrdersCtrl implements ng.IComponentController {

  public gridOptions: uiGrid.IGridOptions;
  public loading: boolean = false;
  public logoutLoading: boolean = true;
  public orderDetailList: IOrderDetail[] = [];

  /* @ngInject */
  constructor(
    private $translate: angular.translate.ITranslateService,
    private Analytics: Analytics,
    private Authinfo: Authinfo,
    private Config: Config,
    private DigitalRiverService: DigitalRiverService,
    private Notification: Notification,
    private MyCompanyOrdersService: MyCompanyOrdersService,
  ) {}

  public $onInit(): void {
    this.loading = true;
    this.initGridOptions();
    this.MyCompanyOrdersService.getOrderDetails().then(orderDetails => {
      // create a modified version of the order details to display in the table, excluding closed orders
      _.map(_.filter(orderDetails, orderDetail => orderDetail.status !== OrderStatus.CLOSED), (origOrderDetail: any) => {
        const orderDetail: IOrderDetail = {
          externalOrderId: origOrderDetail.externalOrderId,
          orderDate: origOrderDetail.orderDate,
          displayDate: origOrderDetail.orderDate,
          total: origOrderDetail.total,
          productDescriptionList: _.map<string, string>(origOrderDetail.productList, 'description').join(', '),
          isTrial: false,
          status: this.$translate.instant('myCompanyOrders.pending'),
          invoiceURL: '',
        };
        const skuList = _.map<string, string>(origOrderDetail.productList, 'sku').join(', ');
        // We only care about Online orders
        if (!_.includes(skuList, OrderType.ONLINE_WEBEX) &&
            !_.includes(skuList, OrderType.ONLINE_SPARK)) {
          return;
        }
        let lang = this.$translate.use();
        if (lang) {
          // Get the current locale and convert to <language>-<country>
          lang = _.toLower(_.replace(lang, '_', '-'));
          // Display the currency symbol based on the order. Default to USD.
          orderDetail.total = origOrderDetail.total.toLocaleString(lang, { style: 'currency',
            currency: origOrderDetail.currency || 'USD' });
          // Display date according to locale
          orderDetail.displayDate = moment(origOrderDetail.orderDate).format('ll');
        }
        if (OrderStatus.COMPLETED === origOrderDetail.status) {
          orderDetail.status = this.$translate.instant('myCompanyOrders.completed');
        } else if (this.Config.webexSiteStatus.PENDING_PARM === origOrderDetail.status) {
          orderDetail.status = this.$translate.instant('myCompanyOrders.pendingActivation');
        }
        if (_.includes(orderDetail.productDescriptionList, OrderType.TRIAL) ||
            _.includes(orderDetail.productDescriptionList, OrderType.FREE)) {
          // trial orders don't display a price
          orderDetail.isTrial = true;
        } else {
          // We need the ID of the admin that placed the order.
          let adminEmail = this.Authinfo.getCustomerAdminEmail();
          const buyerEmail = origOrderDetail.buyerEmail;
          if (buyerEmail !== adminEmail) {
            adminEmail = buyerEmail;
          }
          this.MyCompanyOrdersService.getUserId(adminEmail).then(userId => {
            // generate the URL to display the Digital River invoice
            const product = _.includes(orderDetail.productDescriptionList, this.Config.onlineProducts.webex)
              ? this.Config.onlineProducts.webex : this.Config.onlineProducts.spark;
            this.DigitalRiverService.getInvoiceUrl(orderDetail.externalOrderId, product, userId)
              .then((invoiceUrl: string): void => {
                orderDetail.invoiceURL = invoiceUrl;
              });
          });
        }
        this.orderDetailList.push(orderDetail);
      });
      // sort orders with newest on top
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

  // Called by the template when the user clicks the link.
  public viewInvoice(row: IOrderDetail): void {
    this.Analytics.trackEvent(this.Analytics.sections.ONLINE_ORDER.eventNames.VIEW_INVOICE, {
      orderId: row.externalOrderId,
    });
    this.DigitalRiverService.logout();
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
        width: '*',
      }, {
        name: 'displayDate',
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
        cellTemplate: require('modules/core/myCompany/orders/myCompanyOrdersAction.tpl.html'),
        width: '14%',
      }],
    };
  }
}

angular
  .module('Core')
  .component('myCompanyOrders', {
    template: require('modules/core/myCompany/orders/myCompanyOrders.tpl.html'),
    controller: MyCompanyOrdersCtrl,
  });
