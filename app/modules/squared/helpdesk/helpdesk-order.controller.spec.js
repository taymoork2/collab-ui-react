'use strict';

describe('Controller: HelpdeskOrderController', function () {

  beforeEach(angular.mock.module('Squared'));
  var $stateParams, $controller, $scope, HelpdeskService, Notification, orderController, q;
  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$stateParams_, _HelpdeskService_, _Notification_) {
    HelpdeskService = _HelpdeskService_;
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    $scope = _$rootScope_.$new();
    q = _$q_;
    Notification = _Notification_;

    spyOn(HelpdeskService, 'searchOrders').and.returnValue($.when(getJSONFixture('core/json/orders/order.json')));
    spyOn(HelpdeskService, 'getAccount').and.returnValue($.when(getJSONFixture('core/json/orders/accountResponse.json')));
    spyOn(HelpdeskService, 'getEmailStatus').and.returnValue($.when(getJSONFixture('core/json/orders/emailStatus.json').items));
    spyOn(HelpdeskService, 'getOrg').and.returnValue($.when(getJSONFixture('core/json/orders/orgResponse.json')));
    spyOn(Notification, 'errorWithTrackingId');
  }));

  describe('Order Controller', function () {
    beforeEach(function () {
      $stateParams.id = "67891234";
      orderController = $controller('HelpdeskOrderController', {
        HelpdeskService: HelpdeskService,
        $stateParams: $stateParams
      });
    });

    it('verify order info is correct', function () {
      $scope.$apply();
      expect(orderController.orderId).toBe("67891234");
      expect(orderController.account).toBeDefined();
      expect(orderController.orderUuid).toBe("3e54548d-12ff-43f4-9aff-10c2fcc64130");
      expect(orderController.partnerAdminEmail).toBe("boulder.steamboat@gmail.com");
      expect(orderController.accountName).toBe("All_Pizza_And_Ice_Cream_You_Can_Eatery");
      expect(orderController.provisionTime).toBe(new Date("2016-09-27T22:56:30.051Z").toGMTString());
    });

    it('verify account info is correct', function () {
      $scope.$apply();
      expect(orderController.accountName).toBe("All_Pizza_And_Ice_Cream_You_Can_Eatery");
      expect(orderController.accountOrgId).toBe("bbbc797b-f8a4-424b-9e1d-927e222f532e");
      expect(orderController.customerId).toBe("Atlas_Test_Order_Search_Admin");
      expect(orderController.customerAdminEmail).toBe("snzhuoatlas+inttest_sn30@gmail.com");
      expect(orderController.accountActivationInfo).toBe(new Date("2016-10-20T18:22:31.093Z").toGMTString());
    });

    it('verify email status', function () {
      $scope.$apply();
      expect(orderController.customerEmailSent).toBe(new Date(1476222518.335901 * 1000).toUTCString());
    });
    it('call Notification.errorWithTrackingId and supply the response data when promise is rejected', function () {
      $scope.$apply();
      sinon.stub(HelpdeskService, 'getOrg');
      var rejectData = {
        data: {
          errorCode: 420000
        }
      };
      var promise = q.reject(rejectData);
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
});
