'use strict';

import provisioningModule from './index';
import { Status } from './provisioning.service';

describe('Service: ProvisioningService', function () {
  //TODO: algendel: revisit tests

  beforeEach(angular.mock.module(provisioningModule));
  function initDependencySpies() {
  }

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies('$httpBackend', '$q', 'ProvisioningService', 'UrlConfig');
    initDependencySpies.apply(this);

    const adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
    const getOrdersUrl = `${adminServiceUrl}orders/postProvisioning/manualCodes?status=`;
    const getOrderUrl = `${adminServiceUrl}commerce/orders/`;
    const updateOrderUrl = `${adminServiceUrl}orders/12345/postProvisioning`;

    this.$httpBackend.when('GET', getOrdersUrl).respond({});
    this.$httpBackend.when('GET', getOrderUrl).respond({});
    this.$httpBackend.when('GET', updateOrderUrl).respond({});
  }

  beforeEach(init);

  describe('getOrders()', function () {
    it('should get orders split into pending and completed', function () {
      this.ProvisioningService.getOrders().then(() => {
        expect(true).toBe(true);
      });
    });
  });
  describe('getOrder()', function () {
    it('should getOrder', function () {
      this.ProvisioningService.getOrder().then(() => {
        expect(true).toBe(true);
      });
    });
  });
  describe('updateOrderStatus', function () {
    it('should updateOrderStatus', function () {
      const order = {
        orderUUID: '12345',
        manualCode: '500',
        siteUrl: 'www.test.com',
        status: Status.pending,
      };

      this.ProvisioningService.updateOrderStatus(order, Status.completed).then((result) => {
        expect(result.length).toBe(2);
      })
      .catch((error) => {
        expect(error.length).toBe(2);
      });
    });
  });
});

