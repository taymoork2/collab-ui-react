'use strict';

describe('AddLinesCtrl: Ctrl', function () {
  var controller, $stateParams, $state, $scope, Notification, $q, CommonLineService, CsdmDataModelService, DialPlanService;
  var $controller;
  var $httpBackend;
  var internalNumbers;
  var externalNumbers;
  var externalNumberPool;
  var externalNumberPoolMap;
  var sites;
  var entitylist;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$state_, _$stateParams_, _Notification_, _CsdmDataModelService_, _CommonLineService_, _DialPlanService_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    CommonLineService = _CommonLineService_;
    CsdmDataModelService = _CsdmDataModelService_;
    DialPlanService = _DialPlanService_;
    var current = {
      step: {
        name: 'fakeStep',
      },
    };

    var data = {
      data: {
        deviceName: "Red River",
      },
    };

    $scope.entitylist = [{
      name: "Red River",
    }];

    $scope.wizard = {};
    $scope.wizard.current = current;

    $stateParams.wizard = {
      state: function () {
        return {
          data: {
            account: {
              name: 'Red River',
            },
          },
        };
      },
    };
    $scope.wizardData = data;

    function isLastStep() {
      return false;
    }

    $scope.wizard.isLastStep = isLastStep;

    spyOn($state, 'go');

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    entitylist = $scope.entitylist;
    entitylist[0].externalNumber = externalNumberPool[0];

    sites = getJSONFixture('huron/json/settings/sites.json');

    spyOn(Notification, 'notify');

    spyOn(CommonLineService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(CommonLineService, 'loadInternalNumberPool').and.returnValue($q.resolve(internalNumbers));
    spyOn(CommonLineService, 'getExternalNumberPool').and.returnValue(externalNumbers);

    spyOn(CommonLineService, 'loadExternalNumberPool').and.returnValue($q.resolve(externalNumbers));
    spyOn(CommonLineService, 'loadPrimarySiteInfo').and.returnValue($q.resolve(sites));
    spyOn(CommonLineService, 'mapDidToDn').and.returnValue($q.resolve(externalNumberPoolMap));
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.resolve({
      extensionGenerated: 'false',
    }));

    spyOn(CommonLineService, 'assignMapUserList').and.returnValue((entitylist));

    entitylist[0].assignedDn = internalNumbers[0];
    spyOn(CommonLineService, 'assignDNForUserList').and.callThrough();
  }));

  function initController() {
    controller = $controller('AddLinesCtrl', {
      $scope: $scope,
      $state: $state,
      CommonLineService: CommonLineService,
    });

  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('Places Add DID and DN assignment', function () {
    beforeEach(function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me')
        .respond({});
      initController();
      $scope.entitylist = [{
        name: "Red River",
      }];

      $scope.$apply();
    });

    it('activateDID', function () {

      controller.activateDID();
      $scope.$apply();

      expect($scope.externalNumber.pattern).toEqual('+14084744532');
      expect(CommonLineService.assignDNForUserList).toHaveBeenCalled();
    });

    it('mapDidToDn', function () {
      initController();
      $scope.showExtensions = false;
      controller.mapDidToDn();
      $scope.$apply();
      expect($scope.externalNumber.pattern).toEqual('+14084744532');
    });

  });

  describe('wizard functions', function () {
    var deviceCisUuid;
    var directoryNumber;
    var externalNumber;
    var entitlements;
    beforeEach(function () {
      deviceCisUuid = 'deviceId';
      directoryNumber = 'directoryNumber';
      externalNumber = 'externalNumber';
      entitlements = ['something', 'else'];
    });

    describe('has next', function () {
      describe('with enableCalService', function () {
        beforeEach(function () {
          $stateParams.wizard = {
            state: function () {
              return {
                data: {
                  account: {
                    cisUuid: deviceCisUuid,
                    enableCalService: true,
                  },
                },
              };
            },
            next: function () {
            },
          };
          spyOn($stateParams.wizard, 'next');
          initController();
        });
        it('should evaluate hasNext to true', function () {
          expect(controller.hasNextStep()).toBe(true);
        });
      });
      describe('with enableCalService false and it is editServices', function () {
        beforeEach(function () {
          $stateParams.wizard = {
            state: function () {
              return {
                data: {
                  function: "editServices",
                  account: {
                    cisUuid: deviceCisUuid,
                    enableCalService: false,
                  },
                },
              };
            },
            next: function () {
            },
          };
          spyOn($stateParams.wizard, 'next');
          initController();
        });

        it('should evaluate hasNext to false', function () {
          expect(controller.hasNextStep()).toBe(false);
        });
      });
    });

    describe('next', function () {
      beforeEach(function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                },
              },
            };
          },
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
      });

      it('with only directoryNumber specified should set the wizardState with correct fields for show activation code modal', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({ directoryNumber: directoryNumber });
        controller.next();
        $scope.$apply();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.directoryNumber).toBe(directoryNumber);
        expect(wizardState.account.externalNumber).toBeUndefined();
      });

      it('with only externalNumber specified should set the wizardState with correct fields for show activation code modal', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({ externalNumber: externalNumber });
        controller.next();
        $scope.$apply();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.directoryNumber).toBeUndefined();
        expect(wizardState.account.externalNumber).toBe(externalNumber);
      });
    });

    describe('save', function () {
      beforeEach(function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: entitlements,
                },
              },
            };
          },
          save: function () {
          },
        };
        spyOn($stateParams.wizard, 'save');
        initController();
        $scope.$dismiss = function () {
        };
        spyOn($scope, '$dismiss');
        spyOn(Notification, 'success');
        spyOn(Notification, 'errorResponse');
        spyOn(Notification, 'warning');
      });

      it('passes on the selected numbers to CsdmDataModeService', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: directoryNumber,
          externalNumber: externalNumber,
        });
        var place = { cisUuid: deviceCisUuid };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({ 'http://placeurl': place }));
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.resolve());
        controller.save();
        $scope.$apply();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, entitlements, directoryNumber, externalNumber);
        expect(Notification.success).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalled();
      });

      it('display warning when place not found', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: directoryNumber,
          externalNumber: externalNumber,
        });
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({ 'http://placeurl': {} }));
        controller.save();
        $scope.$apply();
        expect(Notification.warning).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when fetching places fails', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: directoryNumber,
          externalNumber: externalNumber,
        });
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.reject());
        controller.save();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when update fails', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: directoryNumber,
          externalNumber: externalNumber,
        });
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({ 'http://placeurl': { cisUuid: deviceCisUuid } }));
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.reject());
        controller.save();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display warning when no directoryNumber or externalNumber is set', function () {
        spyOn(controller, 'getSelectedNumbers').and.returnValue({});
        controller.save();
        $scope.$apply();
        expect(Notification.warning).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });
    });
  });
});
