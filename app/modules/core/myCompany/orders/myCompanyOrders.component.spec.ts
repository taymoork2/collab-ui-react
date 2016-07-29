describe('Component: myCompanyOrders', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$q', 'MyCompanyOrdersService');

    spyOn(this.MyCompanyOrdersService, 'getOrderDetails').and.returnValue(this.$q.when([{
      number: '123',
      description: 'my order',
      price: '$9.99',
      date: new Date(),
    }]));

    this.compileComponent('myCompanyOrders');
    spyOn(this.controller, 'downloadPdf');
  });

  it('should load data on orderDetailList', function () {
    expect(this.controller.orderDetailList).toEqual(jasmine.any(Array));
    expect(this.controller.orderDetailList.length).toBeGreaterThan(0);
  });

  it('should render ui-grid with a data row', function () {
    expect(this.controller.gridOptions).toBeDefined();
    expect(this.view).toContainElement('.ui-grid-header');
    expect(this.view).toContainElement('.ui-grid-row');
  });

  it('should call downloadPdf on action click', function () {
    this.view.find('.my-company-order-history-actions').click();
    expect(this.controller.downloadPdf).toHaveBeenCalled();
  });
});
