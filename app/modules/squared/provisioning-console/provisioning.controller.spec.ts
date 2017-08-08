'use strict';

import provisioningModule from './index';
import { Status } from './provisioning.service';

describe('Controller: ProvisioningController', function () {

  const orders = getJSONFixture('squared/json/orders.json');
  const orderParams = {
    PENDING: _.filter(orders, { status: 'PENDING' }),
    COMPLETED: _.filter(orders, { status: 'COMPLETED' }),
  };
  beforeEach(angular.mock.module(provisioningModule));


  function initDependencySpies() {
    spyOn(this.ProvisioningService, 'getOrders').and.callFake(function(param) { return orderParams[param]; });
    spyOn(this.ProvisioningService, 'updateOrderStatus').and.returnValue(this.$q.resolve(orders));
  }

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      '$state',
      '$templateCache',
      '$timeout',
      '$translate',
      'ProvisioningService');
    initDependencySpies.apply(this);
    initController.apply(this);
  }

  function initController(): void {
    this.initController('ProvisioningController', {});
  }

  beforeEach(init);

  describe('init controller', () => {
    it('should populate completed and pending orders', function () {
      expect(this.controller.completedOrders.length).toBe(1);
      expect(this.controller.pendingOrders.length).toBe(3);
    });
    it('moveTo should update the order status', function() {
      const order = this.controller.pendingOrders[0];

      expect(this.controller.completedOrders.length).toBe(1);
      expect(this.controller.pendingOrders.length).toBe(3);
      expect(order.status).toEqual(Status.PENDING);
      this.controller.moveTo(order, Status.COMPLETED);
      this.$scope.$digest();
      expect(this.ProvisioningService.updateOrderStatus).toHaveBeenCalledWith(order, Status.COMPLETED);
      expect(order.status).toEqual(Status.COMPLETED);
      expect(this.controller.completedOrders.length).toBe(2);
      expect(this.controller.pendingOrders.length).toBe(2);

    });
  });
});
