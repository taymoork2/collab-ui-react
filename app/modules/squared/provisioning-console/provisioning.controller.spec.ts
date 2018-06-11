'use strict';

import provisioningModule from './index';
import { STATUS_UPDATE_EVENT_NAME } from './provisioning.service';
import { Status } from './provisioning.service';

describe('Controller: ProvisioningController', function () {

  const orders = getJSONFixture('squared/json/orders.json');
  const orderParams = {
    PENDING: _.filter(orders, { status: 'PENDING' }),
    COMPLETED: _.filter(orders, { status: 'COMPLETED' }),
  };

  function initDependencySpies() {
    spyOn(this.ProvisioningService, 'getOrders').and.callFake(function (param) { return orderParams[param]; });
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
  }

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      '$timeout',
      '$translate',
      'Notification',
      'FeatureToggleService',
      'ProvisioningService');
    initDependencySpies.apply(this);
    initController.apply(this);
  }

  function initController(): void {
    this.initController('ProvisioningController', {});
  }

  beforeEach(init);

  describe('init controller', () => {
    beforeEach(function() {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
    });
    it('should populate completed and pending orders', function () {
      expect(this.controller.completedOrders.length).toBe(1);
      expect(this.controller.gridOptions.pending.columnDefs).toContain({ field: 'lastModified', displayName: 'provisioningConsole.lastModified', type: 'date' });
      expect(this.controller.gridOptions.pending.columnDefs).not.toContain({ field : 'queueReceived', displayName: 'provisioningConsole.queueReceived' });
      expect(this.controller.pendingOrders.length).toBe(3);
    });
  });
  describe('init new controller', () => {
    beforeEach(function() {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
      initController.apply(this);
    });
    it('should contain new fields like assignedTo, queueReceived, queueCompleted, completedBy', function() {
      expect(this.controller.gridOptions.completed.columnDefs).toContain({ field: 'queueReceived', displayName: 'provisioningConsole.queueReceived' });
      expect(this.controller.gridOptions.completed.columnDefs).toContain({ field:  'queueCompleted', displayName: 'provisioningConsole.queueCompleted'  });
      expect(this.controller.gridOptions.completed.columnDefs).toContain({ field:  'completedBy', displayName: 'provisioningConsole.completedBy' });
      expect(this.controller.gridOptions.pending.columnDefs).toContain({ field:  'assignedTo', displayName: 'provisioningConsole.assignedTo' });
      expect(this.controller.gridOptions.pending.columnDefs).toContain({ field:  'queueReceived', displayName: 'provisioningConsole.queueReceived' });
    });
  });
  describe('failure handling', () => {
    it('should set pending and completed orders to an empty array and display notification if getOrders returns error', function () {
      this.ProvisioningService.getOrders.and.returnValue(this.$q.reject({ error: 'error' }));
      initController.apply(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
      expect(this.controller.completedOrders.length).toBe(0);
      expect(this.controller.pendingOrders.length).toBe(0);
    });
  });
  describe('update order status', () => {
    it('should update the display once the order status was updated', function () {
      initController.apply(this);
      spyOn(this.controller, 'updateOrderStatusInGrid').and.callThrough();
      const order = _.cloneDeep(this.controller.pendingOrders[1]);
      order.status = Status.COMPLETED;
      this.$rootScope.$broadcast(STATUS_UPDATE_EVENT_NAME, order);
      this.$scope.$digest();
      expect(this.controller.updateOrderStatusInGrid).toHaveBeenCalled();
      expect(this.controller.completedOrders.length).toBe(2);
      expect(this.controller.pendingOrders.length).toBe(2);
    });
  });
});
