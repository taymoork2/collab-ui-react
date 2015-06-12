'use strict';

describe('Controller: ServiceSetup', function () {
  var controller, $scope, $state, $q, ServiceSetup, Notification, HuronCustomer;
  var model, customer, voicemail, externalNumberPool, form;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _ServiceSetup_, _Notification_, _HuronCustomer_) {
    $scope = $rootScope.$new();
    // $state = _$state_;
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;

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
    model = {
      site: {
        uuid: '777-888-666',
        steeringDigit: '5',
        siteSteeringDigit: '6',
        timeZone: {
          value: 'America/Los_Angeles',
          label: '(GMT-08:00) Pacific Time (US & Canada)'
        }
      },
      numberRanges: [{
        beginNumber: '5000',
        endNumber: '5999',
        uuid: '555-666-777'
      }, {
        beginNumber: '6000',
        endNumber: '6999'
      }]
    };
    voicemail = [{
      name: "Simon",
      pilotNumber: "+16506679080"
    }];
    externalNumberPool = [{
      directoryNumber: null,
      pattern: "+14084744518",
      uuid: 'c0d5c7d8-306a-48db-af93-3cba6d433db0'
    }];

    $state = {
      current: {
        data: {
          firstTimeSetup: false
        }
      }
    };

    form = {
      '$invalid': false
    };

    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'deleteInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [model.site];
      return $q.when();
    });
    spyOn(ServiceSetup, 'createSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
    spyOn(ServiceSetup, 'loadExternalNumberPool').and.returnValue($q.when(externalNumberPool));
    spyOn(ServiceSetup, 'updateCustomerVoicemailPilotNumber').and.returnValue($q.when());

    spyOn(ServiceSetup, 'listInternalNumberRanges').and.callFake(function () {
      ServiceSetup.internalNumberRanges = model.numberRanges;
      return $q.when();
    });

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when());
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');

    controller = $controller('ServiceSetupCtrl', {
      $scope: $scope,
      $state: $state,
      ServiceSetup: ServiceSetup
    });

    controller.form = form;

    $scope.$apply();
  }));

  it('should have customer service info', function () {
    expect(controller.hasVoicemailService).toEqual(true);
  });

  it('should have internal number ranges', function () {
    expect(controller.model.numberRanges).toEqual(model.numberRanges);
  });

  describe('deleteInternalNumberRange', function () {

    it('should remove from list and notify success', function () {
      var index = 0;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(model.numberRanges[0]);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(controller.model.numberRanges).not.toContain(internalNumberRange);
    });

    it('should remove from list and not notify', function () {
      var index = 1;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
      expect(Notification.notify).not.toHaveBeenCalled();
      expect(controller.model.numberRanges).not.toContain(internalNumberRange);
    });

    it('should notify error on error', function () {
      ServiceSetup.deleteInternalNumberRange.and.returnValue($q.reject());

      var index = 0;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(controller.model.numberRanges).toContain(internalNumberRange);
    });
  });

  describe('initNext', function () {

    it('should notify on success', function () {
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).not.toHaveBeenCalled();
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
