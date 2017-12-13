describe('Component: myCompanyOrders', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      'Authinfo',
      'Config',
      'DigitalRiverService',
      'MyCompanyOrdersService',
      'Notification',
    );

    const purchaseOrdersList = [{
      externalOrderId: '1',
      orderDate: new Date(),
      status: 'COMPLETED',
      total: 15.95,
      buyerEmail: 'admin@cisco.com',
      productList: [
        { description: 'first description' },
      ],
    }, {
      externalOrderId: '2',
      orderDate: new Date(),
      status: 'PROVISIONING',
      total: 15.95,
      productList: [
        { description: 'fourth description' },
        { description: 'fifth description' },
      ],
      invoiceURL: '',
    }, {
      externalOrderId: '3',
      orderDate: new Date(),
      status: this.Config.webexSiteStatus.PENDING_PARM,
      total: 15.95,
      productList: [
        { description: 'second description' },
      ],
      invoiceURL: '',
    }, {
      externalOrderId: '4',
      orderDate: new Date(),
      status: 'CLOSED',
      total: 15.95,
      productList: [
        { description: 'closed description' },
      ],
      invoiceURL: '',
    }];

    this.purchaseOrdersList = purchaseOrdersList;
    this.getOrderDetailsDefer = this.$q.defer();
    this.getDigitalRiverOrderHistoryUrlDefer = this.$q.defer();

    spyOn(this.Authinfo, 'getCustomerAdminEmail').and.returnValue('admin@cisco.com');
    spyOn(this.MyCompanyOrdersService, 'getOrderDetails').and.returnValue(this.getOrderDetailsDefer.promise);
    spyOn(this.MyCompanyOrdersService, 'getUserId').and.returnValue(this.$q.resolve('123'));
    spyOn(this.Notification, 'errorWithTrackingId');

    spyOn(this.DigitalRiverService, 'logout').and.returnValue(this.$q.resolve());
    spyOn(this.DigitalRiverService, 'getInvoiceUrl').and.returnValue(this.$q.resolve('invoice.com'));

    this.compileComponent('myCompanyOrders');
  });

  it('should render ui-grid from gridOptions', function () {
    expect(this.controller.gridOptions).toBeDefined();
    expect(this.view).toContainElement('.ui-grid-header');
  });

  describe('before data loaded', () => {
    it('should have loading icon with no data', function () {
      expect(this.view).not.toContainElement('.ui-grid-row');
      expect(this.view).toContainElement('.grid-spinner');
    });
  });

  describe('if errors while loading data', () => {
    beforeEach(function () {
      this.getOrderDetailsDefer.reject({
        data: undefined,
        status: 500,
      });
      this.$scope.$apply();
    });

    it('should not have loading icon or data', function () {
      expect(this.view).not.toContainElement('.ui-grid-row');
      expect(this.view).not.toContainElement('.grid-spinner');
      expect(this.controller.orderDetailList).toEqual([]);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(jasmine.any(Object), 'myCompanyOrders.loadError');
    });
  });

  describe('after data loaded', () => {
    beforeEach(function () {
      this.getOrderDetailsDefer.resolve(this.purchaseOrdersList);
      this.$scope.$apply();
    });

    it('should load data on orderDetailList', function () {
      expect(this.controller.orderDetailList).toEqual(jasmine.any(Array));
      expect(this.controller.orderDetailList.length).toBe(3);
      expect(this.controller.orderDetailList[0].productDescriptionList).toEqual('first description');
      expect(this.controller.orderDetailList[1].productDescriptionList).toEqual('fourth description, fifth description');
      expect(this.controller.orderDetailList[2].productDescriptionList).toEqual('second description');
      expect(this.controller.orderDetailList[0].status).toEqual('myCompanyOrders.completed');
      expect(this.controller.orderDetailList[1].status).toEqual('myCompanyOrders.pending');
      expect(this.controller.orderDetailList[2].status).toEqual('myCompanyOrders.pendingActivation');
      expect(this.controller.orderDetailList[0].invoiceURL).toEqual('invoice.com');
    });

    it('should have a data row and no loading icon', function () {
      expect(this.view).toContainElement('.ui-grid-row');
      expect(this.view).not.toContainElement('.grid-spinner');
    });

    // TODO investigate more on unit testing ui-grid sorting
    xit('should concat descriptions into single column', function () {
      expect(this.view.find('.ui-grid-row: first .ui-grid-cell-contents: nth(1)')).toHaveText('first description');
      expect(this.view.find('.ui-grid-row: last .ui-grid-cell-contents: nth(1)')).toHaveText('fourth description, fifth description');
    });

    xit('should sort on order number', function () {
      expect(this.view.find('.ui-grid-row').first()).toContainText('1');
      expect(this.view.find('.ui-grid-row').last()).toContainText('2');

      this.view.find('.ui-grid-header-cell').first().click();

      expect(this.view.find('.ui-grid-row').first()).toContainText('2');
      expect(this.view.find('.ui-grid-row').last()).toContainText('1');
    });
  });
});
