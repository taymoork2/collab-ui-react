import { IOrderDetail } from './myCompanyOrders.service';

describe('Component: myCompanyOrders', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      '$sce',
      'DigitalRiverService',
      'MyCompanyOrdersService',
      'Notification'
    );

    let purchaseOrdersList: IOrderDetail[] = [{
      externalOrderId: '123',
      orderDate: new Date(),
      status: 'COMPLETED',
      total: 15.95,
      productDescriptionList: [
        'first description',
      ],
    }, {
      externalOrderId: '456',
      orderDate: new Date(),
      status: 'COMPLETED',
      total: 15.95,
      productDescriptionList: [
        'fourth description',
        'fifth description',
      ],
    }];

    this.purchaseOrdersList = purchaseOrdersList;
    this.getOrderDetailsDefer = this.$q.defer();
    this.getDigitalRiverOrderHistoryUrlDefer = this.$q.defer();

    spyOn(this.MyCompanyOrdersService, 'getOrderDetails').and.returnValue(this.getOrderDetailsDefer.promise);
    spyOn(this.Notification, 'errorWithTrackingId');

    spyOn(this.DigitalRiverService, 'getDigitalRiverOrderHistoryUrl').and.returnValue(this.getDigitalRiverOrderHistoryUrlDefer.promise);
    spyOn(this.$sce, 'trustAsResourceUrl').and.callThrough();

    this.compileComponent('myCompanyOrders');
    spyOn(this.controller, 'downloadPdf');
  });

  describe('Digital River iframe', () => {
    it('should get digital river order history url to load iframe', function () {
      this.getDigitalRiverOrderHistoryUrlDefer.resolve('https://some.url.com');
      this.$scope.$apply();

      expect(this.DigitalRiverService.getDigitalRiverOrderHistoryUrl).toHaveBeenCalled();
      expect(this.$sce.trustAsResourceUrl).toHaveBeenCalledWith('https://some.url.com');
      expect(this.controller.digitalRiverOrderHistoryUrl.$$unwrapTrustedValue()).toEqual('https://some.url.com');
      expect(this.view.find('iframe')).toHaveAttr('src', 'https://some.url.com');
    });

    it('should notify error if unable to get digital river url', function () {
      this.getDigitalRiverOrderHistoryUrlDefer.reject({
        data: undefined,
        status: 500,
      });
      this.$scope.$apply();

      expect(this.view.find('iframe')).not.toHaveAttr('src');
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(jasmine.any(Object), 'myCompanyOrders.loadError');
    });
  });

  xit('should render ui-grid from gridOptions', function () {
    expect(this.controller.gridOptions).toBeDefined();
    expect(this.view).toContainElement('.ui-grid-header');
  });

  xdescribe('before data loaded', () => {
    it('should have loading icon with no data', function () {
      expect(this.view).not.toContainElement('.ui-grid-row');
      expect(this.view).toContainElement('.grid-refresh .icon-spinner');
    });
  });

  xdescribe('if errors while loading data', () => {
    beforeEach(function () {
      this.getOrderDetailsDefer.reject({
        data: undefined,
        status: 500,
      });
      this.$scope.$apply();
    });

    it('should not have loading icon or data', function () {
      expect(this.view).not.toContainElement('.ui-grid-row');
      expect(this.view).not.toContainElement('.grid-refresh .icon-spinner');
      expect(this.controller.orderDetailList).toEqual([]);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(jasmine.any(Object), 'myCompanyOrders.loadError');
    });
  });

  xdescribe('after data loaded', () => {
    beforeEach(function () {
      this.getOrderDetailsDefer.resolve(this.purchaseOrdersList);
      this.$scope.$apply();
    });

    it('should load data on orderDetailList', function () {
      expect(this.controller.orderDetailList).toEqual(jasmine.any(Array));
      expect(this.controller.orderDetailList.length).toBeGreaterThan(0);
    });

    it('should have a data row and no loading icon', function () {
      expect(this.view).toContainElement('.ui-grid-row');
      expect(this.view).not.toContainElement('.grid-refresh .icon-spinner');
    });

    it('should concat descriptions into single column', function () {
      expect(this.view.find('.ui-grid-row:first .ui-grid-cell-contents:nth(1)')).toHaveText('first description');
      expect(this.view.find('.ui-grid-row:last .ui-grid-cell-contents:nth(1)')).toHaveText('fourth description, fifth description');
    });

    // TODO investigate more on unit testing ui-grid sorting
    xit('should sort on order number', function () {
      expect(this.view.find('.ui-grid-row').first()).toContainText('123');
      expect(this.view.find('.ui-grid-row').last()).toContainText('456');

      this.view.find('.ui-grid-header-cell').first().click();

      expect(this.view.find('.ui-grid-row').first()).toContainText('456');
      expect(this.view.find('.ui-grid-row').last()).toContainText('123');
    });

    // TODO re-enable when `myCompanyOrdersAction.tpl.html` shows an anchor
    xit('should call downloadPdf on action click', function () {
      this.view.find('.my-company-order-history-actions').click();
      expect(this.controller.downloadPdf).toHaveBeenCalled();
    });
  });
});
