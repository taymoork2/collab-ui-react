'use strict';

describe('Controller: HelpdeskOrderController', function () {

  beforeEach(angular.mock.module('Squared'));
  var orderController, XhrNotificationService, $stateParams, HelpdeskService, $controller, $scope;
  beforeEach(inject(function (_$rootScope_, _XhrNotificationService_, _$stateParams_, _HelpdeskService_, _$controller_) {
    HelpdeskService = _HelpdeskService_;
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    XhrNotificationService = _XhrNotificationService_;
    $scope = _$rootScope_.$new();

    spyOn(HelpdeskService, 'searchOrder').and.returnValue($.when(getJSONFixture('core/json/orders/order.json')));
    spyOn(HelpdeskService, 'getAccount').and.returnValue($.when(getJSONFixture('core/json/orders/accountResponse.json')));
    spyOn(HelpdeskService, 'getEmailStatus').and.returnValue($.when('core/json/orders/emailStatus.json'));
  }));

  describe('Order Controller', function () {
    beforeEach(function () {
      $stateParams.id = "67891234";
      orderController = $controller('HelpdeskOrderController', {
        HelpdeskService: HelpdeskService,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService
      });
    });

    it('verify order info is correct', function () {
      $scope.$apply();
      expect(orderController.orderId).toBe("67891234");
      expect(orderController.account).toBeDefined();
      expect(orderController.partnerInfo).toBeDefined();
      expect(orderController.account.accountActivate).toBe("No");
    });

  });
});
