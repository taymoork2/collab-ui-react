'use strict';

var provisioningModule = require('./index').default;
describe('Service: ProvisioningService', function () {
  beforeEach(angular.mock.module(provisioningModule));
  //var someVar;

  function initDependencySpies() {
    //spyOn(this.Analytics, 'trackEvent').and.returnValue(this.$q.resolve());

  }

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies('$q', 'ProvisioningService');
    initDependencySpies.apply(this);
  }

  beforeEach(init);

  describe('getOrders', function () {
    it('should get orders', function () {
      expect(this.ProvisioningService.getOrders().length).toBeGreaterThan(0);
    });
  });
  describe('searchForOrders', function () {
    it('should searchForOrders', function () {
      expect(this.ProvisioningService.searchForOrders().length).toBeGreaterThan(0);
    });
  });
  describe('updateOrderStatus', function () {
    it('should updateOrderStatus', function () {
      var order = {
        orderNumber: '3468364384638',
      };
      this.ProvisioningService.getOrders();
      expect(this.ProvisioningService.updateOrderStatus(order, 'Completed').length).toBeGreaterThan(0);
    });
  });
});
