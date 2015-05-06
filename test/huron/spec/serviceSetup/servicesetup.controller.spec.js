'use strict';

describe('Controller: ServiceSetup', function () {
  var controller, $scope, $q, ServiceSetup, Notification;

  var internalNumberRanges;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _ServiceSetup_, _Notification_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    Notification = _Notification_;

    var site = {
      uuid: '777-888-666',
      steeringDigit: '5',
      siteSteeringDigit: '6'
    };
    internalNumberRanges = [{
      beginNumber: '5000',
      endNumber: '5999',
      uuid: '555-666-777'
    }, {
      beginNumber: '6000',
      endNumber: '6999'
    }];

    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'deleteInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [site];
      return $q.when();
    });

    spyOn(ServiceSetup, 'createSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(site));
    spyOn(ServiceSetup, 'listInternalNumberRanges').and.callFake(function () {
      ServiceSetup.internalNumberRanges = internalNumberRanges;
      return $q.when();
    });
    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when());
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');

    controller = $controller('ServiceSetupCtrl', {
      $scope: $scope,
      ServiceSetup: ServiceSetup
    });

    $scope.$apply();
  }));

  it('should have internal number ranges', function () {
    expect($scope.internalNumberRanges).toEqual(internalNumberRanges);
  });

  describe('deleteInternalNumberRange', function () {

    it('should remove from list and notify success', function () {
      var index = 0;
      var internalNumberRange = internalNumberRanges[index];
      $scope.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect($scope.internalNumberRanges).not.toContain(internalNumberRange);
    });

    it('should remove from list and not notify', function () {
      var index = 1;
      var internalNumberRange = internalNumberRanges[index];
      $scope.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
      expect(Notification.notify).not.toHaveBeenCalled();
      expect($scope.internalNumberRanges).not.toContain(internalNumberRange);
    });

    it('should notify error on error', function () {
      ServiceSetup.deleteInternalNumberRange.and.returnValue($q.reject());

      var index = 0;
      var internalNumberRange = internalNumberRanges[index];
      $scope.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect($scope.internalNumberRanges).toContain(internalNumberRange);
    });
  });

  describe('initNext', function () {

    it('should notify on success', function () {
      $scope.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should create site when firstTimeSetup', function () {
      $scope.firstTimeSetup = true;
      $scope.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should report invalid numbers if patterns are not 4 digits', function () {
      $scope.internalNumberRanges = [{
        beginNumber: '100',
        endNumber: '199'
      }];

      var promise = $scope.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Field validation failed.');
    });

    it('should notify error if createSite fails', function () {
      $scope.firstTimeSetup = true;
      ServiceSetup.createSite.and.returnValue($q.reject());

      var promise = $scope.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Site/extension create failed.');
    });

    it('should notify error if createInternalNumberRange fails', function () {
      ServiceSetup.createInternalNumberRange.and.returnValue($q.reject());

      var promise = $scope.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Site/extension create failed.');
    });
  });

});
