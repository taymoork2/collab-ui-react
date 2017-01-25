'use strict';

describe('Controller: HelpdeskOrderController', function () {

  beforeEach(angular.mock.module('Squared'));
  var $stateParams, $controller, $scope, $timeout, HelpdeskService, Notification, orderController, $q;
  var order1TierJson = getJSONFixture('core/json/orders/order.json');
  var order2TierJson = getJSONFixture('core/json/orders/order2Tier.json');
  beforeEach(inject(function (_$controller_, _$rootScope_, _$stateParams_, _$timeout_, _HelpdeskService_, _Notification_, _$q_) {
    HelpdeskService = _HelpdeskService_;
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    $scope = _$rootScope_.$new();
    $timeout = _$timeout_;
    $q = _$q_;
    Notification = _Notification_;

    spyOn(HelpdeskService, 'getAccount').and.returnValue($.when(getJSONFixture('core/json/orders/accountResponse.json')));
    spyOn(HelpdeskService, 'getEmailStatus').and.returnValue($.when(getJSONFixture('core/json/orders/emailStatus.json').items));
    spyOn(HelpdeskService, 'getOrg').and.returnValue($.when(getJSONFixture('core/json/orders/orgResponse.json')));
    spyOn(HelpdeskService, 'editAdminEmail').and.returnValue($.when({}));
    spyOn(HelpdeskService, 'resendAdminEmail').and.returnValue($.when({}));
    spyOn(Notification, 'errorWithTrackingId');
  }));

  describe('Order Controller Initialization with 1-tier order', function () {
    beforeEach(function () {
      $stateParams.id = '67891234';
      spyOn(HelpdeskService, 'searchOrders').and.returnValue($q.resolve(order1TierJson));
      orderController = $controller('HelpdeskOrderController', {
        HelpdeskService: HelpdeskService,
        $stateParams: $stateParams
      });
    });

    it('verify order info is correct for 1-tier order', function () {
      $scope.$apply();
      expect(orderController.orderId).toBe('67891234');
      expect(orderController.account).toBeDefined();
      expect(orderController.orderUuid).toBe('3e54548d-12ff-43f4-9aff-10c2fcc64130');
      expect(orderController.accountName).toBe('All_Pizza_And_Ice_Cream_You_Can_Eatery');
      expect(orderController.provisionTime).toBe(new Date('2016-09-27T22:56:30.051Z').toGMTString());
    });

    it('verify account info is correct', function () {
      $scope.$apply();
      expect(orderController.accountName).toBe('All_Pizza_And_Ice_Cream_You_Can_Eatery');
      expect(orderController.accountOrgId).toBe('bbbc797b-f8a4-424b-9e1d-927e222f532e');
      expect(orderController.customerAdminEmail).toBe('steamboatcsco@gmail.com');
      expect(orderController.partnerAdminEmail).toBe('boulder.steamboat@gmail.com');
      expect(orderController.accountActivationInfo).toBe(new Date('Thu, 20 Oct 2016 18:22:31 GMT').toGMTString());
    });

    it('verify email status', function () {
      $scope.$apply();
      expect(orderController.customerEmailSent).toBe(new Date(1476222213.459667 * 1000).toUTCString());
    });
    it('call Notification.errorWithTrackingId and supply the response data when promise is rejected', function () {
      $scope.$apply();
      sinon.stub(HelpdeskService, 'getOrg');
      var rejectData = {
        data: {
          errorCode: 420000
        }
      };
      var promise = $q.reject(rejectData);
      HelpdeskService.getOrg.returns(promise);
      $scope.$apply();

      orderController = $controller('HelpdeskOrderController', {
        HelpdeskService: HelpdeskService,
        $stateParams: $stateParams,
        Notification: Notification
      });

      $scope.$apply();
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(rejectData, 'helpdesk.unexpectedError');
    });
  });

  describe('Order Controller Initialization with 2-tier order', function () {
    beforeEach(function () {
      $stateParams.id = '67891234';
      spyOn(HelpdeskService, 'searchOrders').and.returnValue($q.resolve(order2TierJson));
      orderController = $controller('HelpdeskOrderController', {
        HelpdeskService: HelpdeskService,
        $stateParams: $stateParams
      });
    });

    it('verify order info is correct for 2-tier order', function () {
      $scope.$apply();
      expect(orderController.orderId).toBe('67892345');
      expect(orderController.account).toBeDefined();
      expect(orderController.orderUuid).toBe('9feb25f4-d581-42f9-a732-ccccbe3e2e92');
      expect(orderController.customerAdminEmail).toBe('orderPayload@test.com');
      expect(orderController.partnerAdminEmail).toBe('orderPayloadReseller@test.com');
      expect(orderController.accountName).toBe('All_Pizza_And_Ice_Cream_You_Can_Eatery');
    });
  });

  describe('admin email update', function () {
    beforeEach(function () {
      $stateParams.id = '67891234';
      spyOn(HelpdeskService, 'searchOrders').and.returnValue($.when(order1TierJson));
      orderController = $controller('HelpdeskOrderController', {
        $stateParams: $stateParams
      });
    });

    it('update customer admin email will update flag', function () {
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(2);
      orderController.updateCustomerAdminEmail();
      $scope.$apply();
      expect(HelpdeskService.editAdminEmail).toHaveBeenCalledWith('3e54548d-12ff-43f4-9aff-10c2fcc64130', 'steamboatcsco@gmail.com', true);
      expect(orderController.customerAdminEmailEdit).toBe(false);
      expect(orderController.showCustomerEmailSent).toBe(false);
      $timeout.flush();
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(3);
    });

    it('update partner admin email will update flag', function () {
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(2);
      orderController.updatePartnerAdminEmail();
      $scope.$apply();
      expect(HelpdeskService.editAdminEmail).toHaveBeenCalledWith('3e54548d-12ff-43f4-9aff-10c2fcc64130', 'boulder.steamboat@gmail.com', false);
      expect(orderController.partnerAdminEmailEdit).toBe(false);
      expect(orderController.showPartnerEmailSent).toBe(false);
      $timeout.flush();
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(3);
    });

    it('resend admin email success', function () {
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(2);
      orderController.resendAdminEmail(true);
      $scope.$apply();
      expect(orderController.showCustomerEmailSent).toBe(false);
      $timeout.flush();
      expect(HelpdeskService.getEmailStatus).toHaveBeenCalledTimes(3);
    });
  });
});
