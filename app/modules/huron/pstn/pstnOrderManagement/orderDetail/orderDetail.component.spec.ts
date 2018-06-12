import orderDetailModule from './index';
describe('Component: OrderDetail', () => {
  beforeEach(function () {
    this.initModules(orderDetailModule);
    this.injectDependencies('PstnService',
      '$q',
      '$stateParams',
      '$translate',
      '$scope',
    );
    const customer = { customerOrgId: '1b8b5381-d908-4f28-9f23-bcd61d0792b8' };
    this.$scope.currentCustomer = _.cloneDeep(customer);
    this.$scope.orders = getJSONFixture('huron/json/orderManagement/pstnOrderHistory.json');
  });

  function initComponent() {
    spyOn(this.PstnService, 'getCustomerV2').and
      .returnValue(this.$q.resolve({ trial: true, name: 'ATLAS_Test_Customer' }));
    spyOn(this.PstnService, 'getCustomerTrialV2').and
      .returnValue(this.$q.resolve({ acceptedDate: 'today' }));
    spyOn(this.$translate, 'instant');
  }

  describe('Component: OrderDetail-fulfilledBlockOrder', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.fulfilledBlockOrder',
      });
    });
    it('should initialize the controller', function () {
      expect(this.controller).toBeDefined();
    });
    it('should properly format the IP response', function () {
      expect(angular.copy(this.controller.info)).toContain({
        number: '+14697862340',
        label: '(469) 786-2340',
        status: 'Successful',
        tooltip: 'Completed Successfully',
      }, {
        number: '+14697862371',
        label: '(469) 786-2371',
        status: 'Successful',
        tooltip: 'Completed Successfully',
      });
    });
    it('should set the createdBy to customerName', function () {
      expect(this.controller.createdBy).toBe('ATLAS_Test_Customer');
    });
    it('should make PstnService calls to fetch the data', function () {
      expect(this.PstnService.getCustomerTrialV2).toHaveBeenCalled();
    });
  });

  describe('Component: OrderDetail- pendingBlockOrder', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$translate.instant.and.returnValue('Quantity');
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.pendingBlockOrder',
      });
    });
    it('should properly format the IP response', function () {
      expect(angular.copy(this.controller.info)).toContain({
        label: '(469) XXX-XXXX Quantity: 2',
        status: 'In Progress',
        tooltip: 'Still Pending Queue',
      });
    });
    it('should make PstnService calls to fetch the data', function () {
      expect(this.PstnService.getCustomerV2).toHaveBeenCalled();
      expect(this.PstnService.getCustomerTrialV2).toHaveBeenCalled();
    });
  });

  describe('Component: OrderDetail-Parnter placed the pendingBlockOrder', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$translate.instant.and.returnValue('Partner');
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.pendingBlockOrder',
      });
    });
    it('should have created by Partner', function () {
      expect(this.controller.createdBy).toBe('Partner');
    });
  });

  describe('Component: OrderDetail- fulfilledNumberOrder', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.fulfilledNumberOrder',
      });
    });
    it('should properly format the IP response', function () {
      expect(angular.copy(this.controller.info)).toContain({
        number: '+14697862340',
        label: '(469) 786-2340',
        status: 'Successful',
        tooltip: 'Completed Successfully',
      }, {
        number: '+14697862371',
        label: '(469) 786-2371',
        status: 'Successful',
        tooltip: 'Completed Successfully',
      });
    });
  });
  describe('View: OrderDetail- fulfilledNumberOrder', () => {
    const ORDER_NUMBER = 'h3#orderNumber';
    const ORDER_CREATED = 'span#orderCreated';
    const ORDER_STATUS = 'span#orderStatus';
    const NUMBER_SEARCH_INPUT = 'input#numberSearchInput';
    const ORDER_TYPE = 'span#orderType';
    beforeEach(initComponent);
    beforeEach(function () {
      this.$translate.instant.and.returnValue('Partner');
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.fulfilledNumberOrder',
        isCarrierByopstn: 'false',
      });
    });
    it('should have the order status and number', function () {
      expect(this.view.find(ORDER_NUMBER)).toExist();
      expect(this.view.find(ORDER_CREATED)).toExist();
      expect(this.view.find(ORDER_STATUS)).toExist();
    });
    it('should have an input search to find the number', function () {
      expect(this.view.find(NUMBER_SEARCH_INPUT)).toExist();
      expect(this.view.find(NUMBER_SEARCH_INPUT)).toHaveAttr('placeholder');
    });
    it('should have createdBy a Partner by default', function () {
      expect(this.controller.createdBy).toBe('Partner');
    });
    it('should have orderType', function () {
      expect(this.view.find(ORDER_TYPE)).toExist();
    });
  });
  describe('Component: OrderDetail - Swivel Carrier: Numbers ImportDetail', () => {
    const ORDER_NUMBER = 'h3#orderNumber';
    const ORDER_DATE = 'h3#orderDate';
    const ORDER_CREATED = 'span#orderCreated';
    const IMPORT_CREATED_BY = 'span#importCreatedBy';
    const ORDER_STATUS = 'span#orderStatus';
    const NUMBER_SEARCH_INPUT = 'input#numberSearchInput';
    const ORDER_TYPE = 'span#orderType';
    beforeEach(initComponent);
    beforeEach(function () {
      this.$translate.instant.and.returnValue('Partner');
      this.compileComponent('ucOrderDetail', {
        currentCustomer: 'currentCustomer',
        currentOrder: 'orders.fulfilledNumberOrder',
        isCarrierByopstn: 'true',
      });
    });
    it('should have order date, import createdBy', function () {
      expect(this.view.find(ORDER_NUMBER)).not.toExist();
      expect(this.view.find(ORDER_DATE)).toExist();
      expect(this.view.find(ORDER_CREATED)).not.toExist();
      expect(this.view.find(IMPORT_CREATED_BY)).toExist();
      expect(this.view.find(ORDER_STATUS)).toExist();
    });
    it('should have an input search to find the number', function () {
      expect(this.view.find(NUMBER_SEARCH_INPUT)).toExist();
      expect(this.view.find(NUMBER_SEARCH_INPUT)).toHaveAttr('placeholder');
    });
    it('should have createdBy a Partner by default', function () {
      expect(this.controller.createdBy).toBe('Partner');
    });
    it('should have the order status and number', function () {
      expect(this.view.find(ORDER_NUMBER)).not.toExist();
      expect(this.view.find(ORDER_DATE)).toExist();
      expect(this.view.find(ORDER_CREATED)).not.toExist();
      expect(this.view.find(ORDER_STATUS)).toExist();
    });
    it('should  not have orderType', function () {
      expect(this.view.find(ORDER_TYPE)).not.toExist();
    });
  });
});
