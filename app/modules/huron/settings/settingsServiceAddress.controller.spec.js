'use strict';

describe('Controller: SettingsServiceAddressCtrl', function () {
  var controller, $controller, $scope, $q, $timeout, PstnServiceAddressService, Authinfo, Notification;
  var address = getJSONFixture('huron/json/pstnSetup/huronServiceAddress.json');
  var updatedAddress = angular.copy(address);
  updatedAddress.streetAddress += 'updated';

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$timeout_, _PstnServiceAddressService_, _Authinfo_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;

    spyOn(PstnServiceAddressService, 'getAddress').and.returnValue($q.when(address));
    spyOn(PstnServiceAddressService, 'lookupAddress').and.returnValue($q.when(updatedAddress));
    spyOn(PstnServiceAddressService, 'createCustomerSite').and.returnValue($q.when());
    spyOn(PstnServiceAddressService, 'updateAddress').and.returnValue($q.when());
    spyOn(Notification, 'error');
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');

    controller = $controller('SettingsServiceAddressCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should init data', function () {
    expect(controller.loadingInit).toEqual(false);
    expect(controller.address).toEqual(address);
    expect(controller.isValid).toEqual(true);
    expect(controller.hasModify()).toEqual(true);
    expect(controller.hasValidate()).toEqual(false);
    expect(controller.hasSave()).toEqual(false);
  });

  it('modify should make form editable', function () {
    controller.modify();
    $scope.$apply();

    expect(controller.hasModify()).toEqual(false);
    expect(controller.hasValidate()).toEqual(true);
    expect(controller.hasSave()).toEqual(false);
  });

  it('validate should make form saveable', function () {
    controller.validate();
    $scope.$apply();

    expect(controller.hasModify()).toEqual(false);
    expect(controller.hasValidate()).toEqual(false);
    expect(controller.hasSave()).toEqual(true);
    expect(controller.address).toEqual(updatedAddress);
  });

  it('save should update existing site', function () {
    controller.address = updatedAddress;

    expect(controller.hasModify()).toEqual(false);
    expect(controller.hasValidate()).toEqual(false);
    expect(controller.hasSave()).toEqual(true);

    controller.save();
    $scope.$apply();
    $timeout.flush();

    expect(PstnServiceAddressService.updateAddress).toHaveBeenCalled();
    expect(controller.hasModify()).toEqual(true);
    expect(controller.hasValidate()).toEqual(false);
    expect(controller.hasSave()).toEqual(false);
  });

});
