'use strict';

describe('Controller: ServiceSetup', function () {
  var controller, $scope, $q, ServiceSetup, Notification, HuronCustomer;
  var site, customer, internalNumberRanges, voicemail, externalNumberPool;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _ServiceSetup_, _Notification_, _HuronCustomer_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;

    site = {
      uuid: '777-888-666',
      steeringDigit: '5',
      siteSteeringDigit: '6',
      siteCode: '200',
      voicemailPilotNumber: 'something'
    };
    customer = {
      "uuid": "84562afa-2f35-474f-ba0f-2def42864e12",
      "name": "Atlas_Test_JP650",
      "servicePackage": "DEMO_STANDARD",
      "links": [{
        "rel": "common",
        "href": "/api/v1/common/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voicemail",
        "href": "/api/v1/voicemail/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voice",
        "href": "/api/v1/voice/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }]
    };
    internalNumberRanges = [{
      beginNumber: '5000',
      endNumber: '5999',
      uuid: '555-666-777'
    }, {
      beginNumber: '6000',
      endNumber: '6999'
    }];
    voicemail = [{
      name: "Simon",
      pilotNumber: "+16506679080"
    }];
    externalNumberPool = [{
      directoryNumber: null,
      pattern: "+14084744518",
      uuid: 'c0d5c7d8-306a-48db-af93-3cba6d433db0'
    }];

    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'deleteInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [site];
      return $q.when();
    });
    spyOn(ServiceSetup, 'createSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(site));

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
    spyOn(ServiceSetup, 'loadExternalNumberPool').and.returnValue($q.when(externalNumberPool));
    spyOn(ServiceSetup, 'updateCustomerVoicemailPilotNumber').and.returnValue($q.when());

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

  it('should have customer service info', function () {
    expect(controller.hasVoicemailService).toEqual(true);
  });

  it('should have internal number ranges', function () {
    expect(controller.internalNumberRanges).toEqual(internalNumberRanges);
  });

  describe('deleteInternalNumberRange', function () {

    it('should remove from list and notify success', function () {
      var index = 0;
      var internalNumberRange = internalNumberRanges[index];
      controller.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(controller.internalNumberRanges).not.toContain(internalNumberRange);
    });

    it('should remove from list and not notify', function () {
      var index = 1;
      var internalNumberRange = internalNumberRanges[index];
      controller.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
      expect(Notification.notify).not.toHaveBeenCalled();
      expect(controller.internalNumberRanges).not.toContain(internalNumberRange);
    });

    it('should notify error on error', function () {
      ServiceSetup.deleteInternalNumberRange.and.returnValue($q.reject());

      var index = 0;
      var internalNumberRange = internalNumberRanges[index];
      controller.deleteInternalNumberRange(index, internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(controller.internalNumberRanges).toContain(internalNumberRange);
    });
  });

  describe('initNext', function () {

    it('should notify on success when not firstTimeSetup', function () {
      controller.firstTimeSetup = false;
      controller.pilotNumberSelected = externalNumberPool[0];
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomerVoicemailPilotNumber).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should create site when firstTimeSetup', function () {
      controller.firstTimeSetup = true;
      controller.pilotNumberSelected = externalNumberPool[0];
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomerVoicemailPilotNumber).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should report invalid numbers if patterns are not 4 digits', function () {
      controller.internalNumberRanges = [{
        beginNumber: '100',
        endNumber: '199'
      }];

      var promise = controller.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Field validation failed.');
    });

    it('should notify error if createSite fails', function () {
      controller.firstTimeSetup = true;
      ServiceSetup.createSite.and.returnValue($q.reject());

      var promise = controller.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Site/extension create failed.');
    });

    it('should notify error if createInternalNumberRange fails', function () {
      ServiceSetup.createInternalNumberRange.and.returnValue($q.reject());

      var promise = controller.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Site/extension create failed.');
    });
  });

});
