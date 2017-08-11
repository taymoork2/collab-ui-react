'use strict';

import provisioningModule from './../index';

describe('Controller: ProvisioningDetailsController', function () {
  const order_detail = getJSONFixture('squared/json/order_detail.json');
  const orders = getJSONFixture('squared/json/orders.json');
  orders[0].siteUrl = 'atlastestlos071202a.webex.com';

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
      'ProvisioningService');
    initDependencySpies.apply(this);
  }

  function initController(orderIndex): void {
    const locals = {
      controllerLocals: {
        $stateParams: {
          order: orders[orderIndex],
        },
      },
    };
    this.initController('ProvisioningDetailsController', locals);
  }

  beforeEach(init);

  describe('init controller', () => {

    it('should set dateInfo to the \'orderReceived\' date for not completed orders', function () {
      initController.call(this, 0);
      const dateReceivedFormatted = orders[0].orderReceived;
      expect(this.controller.dateInfo).toEqual(dateReceivedFormatted);
      expect(this.ProvisioningService.getOrder).toHaveBeenCalledWith(orders[0].orderUUID);
    });
    it('should set dateInfo to the \'lastModified\' date for completed orders', function () {
      initController.call(this, 4);
      const dateModifiedFormatted = orders[4].lastModified;
      expect(this.controller.dateInfo).toEqual(dateModifiedFormatted);
      expect(this.ProvisioningService.getOrder).toHaveBeenCalledWith(orders[4].orderUUID);
    });
    it('getServiceItemsForSite should return an object with serviceItems arrays', function () {
      initController.call(this, 0);
      const result = this.controller.getServiceItemsForSite(order_detail.orderContent.serviceItems);
      expect(result.conferencing.length).toBe(2);
      expect(result.cmr.length).toBe(1);
      expect(result.audio.length).toBe(1);
      expect(result.storage.length).toBe(0);
    });
  });
});
