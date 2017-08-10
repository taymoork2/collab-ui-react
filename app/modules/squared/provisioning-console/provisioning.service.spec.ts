'use strict';

import provisioningModule from './index';
import { Status } from './provisioning.service';

describe('Service: ProvisioningService', function () {

  const orders = getJSONFixture('squared/json/orders.json');
  const orderDetail =  getJSONFixture('squared/json/order_detail.json');
  const getOrdersStatus = Status.COMPLETED;
  const getOrderUUID = '0b78cfa4-ee95-4a4d-81ee-8549a98f7761';
  const orderUpdateResponse = {
    manualCode: '500',
    siteUrl: 'siteTest176d346b-522d-4383-9fe8-4f8b5d1db73d.webex.com',
    status: 'COMPLETED',
  };

  function init() {
    this.initModules(provisioningModule);
    this.injectDependencies('$httpBackend', '$q', 'ProvisioningService', 'UrlConfig');

    this.adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
    this.getOrdersUrl = `${this.adminServiceUrl}orders/postProvisioning/manualCodes?status=${getOrdersStatus}`;
    this.getOrderUrl = `${this.adminServiceUrl}commerce/orders/${getOrderUUID}`;
    this.updateOrderUrl = `${this.adminServiceUrl}orders/${getOrderUUID}/postProvisioning`;
    this.$httpBackend.when('GET', this.getOrdersUrl).respond({ orderList: orders });
    this.$httpBackend.when('GET', this.getOrderUrl).respond({ orderDetail });
    this.$httpBackend.when('POST', this.updateOrderUrl).respond({ orderUpdateResponse });
  }

  beforeEach(init);
  afterEach(function() {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getOrders()', function () {
    it('should get order list', function () {
      this.$httpBackend.expectGET(this.getOrdersUrl);
      this.ProvisioningService.getOrders(getOrdersStatus).then((response) => {
        expect (response.length).toBe(5);
      });
      this.$httpBackend.flush();
    });
  });
  describe('getOrder()', function () {
    it('should return a single order details', function () {
      this.$httpBackend.expectGET(this.getOrderUrl);
      this.ProvisioningService.getOrder(getOrderUUID).then((response) => {
        expect(response.orderDetail.orderContent).toBeDefined();
      });
      this.$httpBackend.flush();
    });
  });
  describe('updateOrderStatus', function () {
    it('should updateOrderStatus', function () {
      const order = {
        orderUUID: getOrderUUID,
        manualCode: '500',
        siteUrl: 'www.test.com',
        status: Status.PENDING,
      };
      this.$httpBackend.expectPOST(this.updateOrderUrl);
      this.ProvisioningService.updateOrderStatus(order, Status.COMPLETED).then((result) => {
        expect(result.orderUpdateResponse.status).toBe(getOrdersStatus);
      });
      this.$httpBackend.flush();
    });
  });
});

