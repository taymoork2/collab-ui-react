import ordersOverviewModule from './index';
describe('Component: OrdersOverview', () => {
  let customerOrders = getJSONFixture('huron/json/orderManagement/pstnOrdersOverview.json');

  beforeEach(function () {
    this.initModules(ordersOverviewModule);
    this.injectDependencies('PstnService',
                            '$q',
                            '$stateParams',
                            '$translate',
                            '$scope',
    );
    const customer = { customerOrgId: '1b8b5381-d908-4f28-9f23-bcd61d0792b8' };
    this.$scope.currentCustomer = _.cloneDeep(customer);
  });
  function initComponent() {
    spyOn(this.PstnService, 'getFormattedNumberOrders').and.returnValue(this.$q.resolve(_.cloneDeep(customerOrders)));
    this.compileComponent('ucOrdersOverview', {
      currentCustomer: 'currentCustomer',
    });
  }

  describe('Component: OrdersOverview', () => {
    beforeEach(initComponent);
    it('should have called getFormattedNumberOrders PstnService function', function () {
      expect(this.PstnService.getFormattedNumberOrders).toHaveBeenCalled();
    });
    it('should have the correct number of combined orders', function () {
      expect(this.controller.ordersWithDuplicates.length).toEqual(3);
      expect(this.controller.orders.length).toEqual(2);
    });

    it('should have the correct count of combined numbers', function () {
      expect(this.controller.orders[0].numbers.length).toEqual(2);
      expect(angular.copy(this.controller.orders)).toContain({
        uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b6',
        carrierOrderId: '12345',
        carrierBatchId: '11',
        status: 'PENDING',
        numbers: [{ number: '9728134000', network: 'QUEUED' }, { number: '9728134001', network: 'PROVISIONED' }],
      }, {
        uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b8',
        carrierOrderId: '12346',
        carrierBatchId: '11',
        status: 'PENDING',
        numbers: [{ number: '9728134002', network: 'QUEUED' }],
      });
    });

    it('should have the correct status of the combined order', function () {
      expect(this.controller.orders[0].status).toEqual('PENDING');
    });
  });
  describe('View: OrdersOverview', () => {
    const ORDER_SEARCH_INPUT = 'input#orderSearchInput';
    const ORDER_NAME = 'span#orderName';
    const ORDER_STATUS = 'span#orderStatus';
    const ORDER_LIST = '#ordersList';
    beforeEach(initComponent);
    it('should display Order Search Input and placeholder text', function () {
      expect(this.view.find(ORDER_SEARCH_INPUT)).toExist();
      expect(this.view.find(ORDER_SEARCH_INPUT)).toHaveAttr('placeholder');
      expect(this.view.find(ORDER_SEARCH_INPUT).attr('placeholder')).toEqual('pstnOrderOverview.searchPlaceholder');
    });
    it('should display search icon in the input box', function () {
      expect(this.view.find('i:first')).toHaveClass('icon');
      expect(this.view.find('i:first')).toHaveClass('icon-search');
    });

    it('should display the order Number and order status ', function () {
      expect(this.view.find(ORDER_NAME)).toExist();
      expect(this.view.find(ORDER_STATUS)).toExist();
    });
    it('should have order list of two elements', function () {
      expect(this.view.find(ORDER_LIST)).toExist();
      expect(this.view.find(ORDER_LIST).length).toEqual(2);
    });
  });
});
