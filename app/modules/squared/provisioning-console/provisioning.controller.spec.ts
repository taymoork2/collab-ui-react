'use strict';

import provisioningModule from './index';
import { Status } from './provisioning.service';

describe('Controller: ProvisioningController', function () {

  // TODO: algendel - write meaningful tests
  const orders = getJSONFixture('squared/json/orders.json');

  beforeEach(angular.mock.module(provisioningModule));
  function initDependencySpies() {
    spyOn(this.ProvisioningService, 'getOrders').and.returnValue(this.$q.resolve(orders));
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
    this.controller = this.$controller('ProvisioningController', {
      $scope: this.$scope,
      $timeout: this.$timeout,
      $q: this.$q,
    });
    this.$scope.$apply();
  }

  beforeEach(init);

  describe('init controller', () => {
    it('should exist', function () {
      expect(this.controller).toBeDefined();
      expect(this.controller.completedOrders.length).toBe(5);
    });
    it('moveTo should update the order status', function() {
      const order = {
        orderUUID: '123',
        siteUrl: 'www.xxy.com',
      };

      expect(this.controller).toBeDefined();
      this.controller.moveTo(order, Status.completed);
      expect(this.ProvisioningService.updateOrderStatus).toHaveBeenCalled();
    });

  });
});
