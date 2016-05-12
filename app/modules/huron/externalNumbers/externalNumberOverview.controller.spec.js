'use strict';

describe('Controller: ExternalNumberOverviewCtrl', function () {
  var controller, $controller, $scope, $state, $stateParams, $q, ExternalNumberService, Notification;

  var externalNumbers;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _$stateParams_, _$q_, _ExternalNumberService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    externalNumbers = [{
      'pattern': '123'
    }, {
      'pattern': '456'
    }];

    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'getAllNumbers').and.returnValue(externalNumbers);
    spyOn(ExternalNumberService, 'getQuantity').and.returnValue(2);
    spyOn(ExternalNumberService, 'isTerminusCustomer').and.returnValue($q.when(true));
    spyOn(Notification, 'errorResponse');
    spyOn($state, 'go');

    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should get the number of phone numbers', function () {
    expect(controller.allNumbersCount).toEqual(2);
  });

  it('should show 0 numbers on error', function () {
    ExternalNumberService.refreshNumbers.and.returnValue($q.reject());
    ExternalNumberService.getAllNumbers.and.returnValue([]);
    ExternalNumberService.getQuantity.and.returnValue(0);
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(controller.allNumbersCount).toEqual(0);
  });

  it('should show 0 numbers if no customer found', function () {
    ExternalNumberService.getAllNumbers.and.callThrough();
    ExternalNumberService.getQuantity.and.returnValue(0);
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(0);
  });

  describe('customerCommunicationLicenseIsTrial flag', function () {
    it('should be true if communication license is a trial.', function () {
      controller.currentCustomer = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        communications: {
          isTrial: true
        }
      };
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.when(true));
      controller.addNumbers();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: controller.currentCustomer.customerOrgId,
        customerName: controller.currentCustomer.customerName,
        customerEmail: controller.currentCustomer.customerEmail,
        customerCommunicationLicenseIsTrial: true
      });
    });

    it('should be false if communication license is not a trial.', function () {
      controller.currentCustomer = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        communications: {
          isTrial: false
        }
      };
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.when(true));
      controller.addNumbers();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: controller.currentCustomer.customerOrgId,
        customerName: controller.currentCustomer.customerName,
        customerEmail: controller.currentCustomer.customerEmail,
        customerCommunicationLicenseIsTrial: false
      });
    });

    it('should be true if trial data is missing.', function () {
      controller.currentCustomer = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com'
      };
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.when(true));
      controller.addNumbers();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: controller.currentCustomer.customerOrgId,
        customerName: controller.currentCustomer.customerName,
        customerEmail: controller.currentCustomer.customerEmail,
        customerCommunicationLicenseIsTrial: true
      });
    });

    it('should always be false if isPartner is true.', function () {
      controller.currentCustomer = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        isPartner: true,
        communications: {
          isTrial: true
        }
      };
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.when(true));
      controller.addNumbers();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: controller.currentCustomer.customerOrgId,
        customerName: controller.currentCustomer.customerName,
        customerEmail: controller.currentCustomer.customerEmail,
        customerCommunicationLicenseIsTrial: false
      });
    });
  });

});
