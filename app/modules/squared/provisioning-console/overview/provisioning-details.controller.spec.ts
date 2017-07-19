'use strict';

import provisioningModule from './../index';

describe('Controller: ProvisioningDetailsController', function () {
  // TODO: algendel: write meaningful tests
  const order_detail =  getJSONFixture('squared/json/order_detail.json');
  const orders = getJSONFixture('core/json/orders/order.json');
  orders[0].siteUrl = 'atlastestlos071202a.webex.com';
  beforeEach(angular.mock.module(provisioningModule));
  function initDependencySpies() {
    spyOn(this.ProvisioningService, 'getOrder').and.returnValue(this.$q.resolve(order_detail));

  }

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      '$templateCache',
      '$timeout',
      '$translate',
      'ProvisioningService');

    initDependencySpies.apply(this);
    this.$stateParams.order = orders[0];
    initController.apply(this);
  }

  function initController(): void {
    this.controller = this.$controller('ProvisioningDetailsController', {
      $scope: this.$scope,
      $timeout: this.$timeout,
      $stateParams: this.$stateParams,
      $q: this.$q,
    });
    this.$scope.$apply();
  }

  beforeEach(init);

  describe('init controller', () => {
    it('should exist', function () {
      expect(this.controller).toBeDefined();
    });
    it('getServiceItemsForSite should return an object with serviceItems arrays', function() {
      const result = this.controller.getServiceItemsForSite(order_detail.orderContent.serviceItems);
      expect(result.conferencing.length).toBe(2);
      expect(result.cmr.length).toBe(1);
      expect(result.audio.length).toBe(1);
      expect(result.storage.length).toBe(0);
    });

  });
});
