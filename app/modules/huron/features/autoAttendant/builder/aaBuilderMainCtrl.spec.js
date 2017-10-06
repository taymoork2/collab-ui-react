'use strict';

describe('Controller: AABuilderMainCtrl', function () {
  var $controller, controller;
  var AACalendarService, AACommonService, AADependencyService, AAModelService, AANotificationService, AANumberAssignmentService, AARestModelService, AATrackChangeService, AAUiModelService, AAUiScheduleService, AAValidationService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AutoAttendantCeService, AutoAttendantLocationService, DoRestService, FeatureToggleService, HuronConfig;
  var $compile, $httpBackend, $modalStack, $q, $rootScope, $scope, $state, $stateParams;
  var element, sysModel, ServiceSetup, timeZone, translatedTimeZone;
  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var doRest = getJSONFixture('huron/json/autoAttendant/doRest.json');
  var a3LaneCe = getJSONFixture('huron/json/autoAttendant/a3LaneCe.json');
  var combinedMenus = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');
  var menuWithNewStep = combinedMenus['menuWithNewStep'];
  var rawCeInfo = {
    callExperienceName: 'AAA2',
    callExperienceURL: 'https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b',
    assignedResources: [{
      id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
      type: 'directoryNumber',
      trigger: 'incomingCall',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
    }],
  };
  var restBlock = {
    restConfigUrl: 'https://ces.hitest.huron-dev.com/api/v1/rest/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/restConfigs/89c76add-0e5d-48fe-9a4c-36aa201ec8ae',
  };

  var restId = 'fca066b1-4938-4b5f-9870-9e66ad17e0a2';
  var aaModel = {};
  var restBlocks = {};
  var uiRestBlocks = {};
  uiRestBlocks['fca066b1-4938-4b5f-9870-9e66ad17e0a2'] = {
    method: 'GET',
    url: 'test URL',
    responseActions: [{
      assignVar: {
        variableName: 'test var3',
        value: 'res3',
      },
    }],
  };
  uiRestBlocks['TEMP_0'] = {
    method: 'GET',
    url: 'test URL3',
    responseActions: [{
      assignVar: {
        variableName: 'test var',
        value: 'res',
      },
    }],
  };
  restBlocks['abc066b1-4938-4b5f-9870-9e66ad17edef'] = {
    method: 'GET',
    url: 'test URL2',
    responseActions: [{
      assignVar: {
        variableName: 'test var2',
        value: 'res2',
      },
    }],
  };
  restBlocks['abc066b2-3938-445f-9870-9e66ad17edef'] = {
    method: 'GET',
    url: 'test URL23',
    responseActions: [{
      assignVar: {
        variableName: 'test var23',
        value: 'res23',
      },
    }],
  };

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      _resource.setUUID(rawCeInfo.assignedResources[j].uuid);
      if (!_.isUndefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$modalStack_, _$q_, _$rootScope_, _$state_, _$stateParams_,
    _AACalendarService_, _AACommonService_, _AADependencyService_, _AAModelService_, _AANotificationService_, _AANumberAssignmentService_,
    _AATrackChangeService_, _AARestModelService_, _AAUiModelService_, _AAUiScheduleService_, _AAValidationService_, _AutoAttendantCeInfoModelService_,
    _AutoAttendantCeMenuModelService_, _AutoAttendantCeService_, _AutoAttendantLocationService_, _DoRestService_, _FeatureToggleService_, _HuronConfig_, _ServiceSetup_) {
    $state = _$state_;
    $rootScope = _$rootScope_;
    $modalStack = _$modalStack_;

    $q = _$q_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $scope.$dismiss = function () {
      return true;
    };
    $stateParams = _$stateParams_;
    $controller = _$controller_;
    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;
    AARestModelService = _AARestModelService_;

    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AutoAttendantLocationService = _AutoAttendantLocationService_;

    AAValidationService = _AAValidationService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AACommonService = _AACommonService_;
    DoRestService = _DoRestService_;
    AANumberAssignmentService = _AANumberAssignmentService_;
    AANotificationService = _AANotificationService_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    AAUiScheduleService = _AAUiScheduleService_;
    AACalendarService = _AACalendarService_;
    AATrackChangeService = _AATrackChangeService_;
    AADependencyService = _AADependencyService_;
    FeatureToggleService = _FeatureToggleService_;
    ServiceSetup = _ServiceSetup_;

    // aaModel.dataReadyPromise = $q(function () {});
    $stateParams.aaName = '';

    sysModel = {
      site: {
        uuid: '777-888-666',
        steeringDigit: '5',
        siteSteeringDigit: '6',
        siteCode: '200',
        voicemailPilotNumber: '+16506679080',
        timeZone: 'America/Los_Angeles',
      },
    };
    timeZone = [{
      id: 'America/Los_Angeles',
      label: 'America/Los_Angeles',
    }];
    translatedTimeZone = [{
      id: 'America/Los_Angeles',
      label: 'timeZones.America/Los_Angeles',
    }];

    spyOn($state, 'go');
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUiModelService, 'initUiModel');
    spyOn(AARestModelService, 'getRestBlocks').and.returnValue(restBlocks);
    spyOn(AARestModelService, 'getUiRestBlocks').and.returnValue(uiRestBlocks);
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue($q.resolve($stateParams.aaName));
    spyOn(AutoAttendantCeMenuModelService, 'clearCeMenuMap');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.resolve(timeZone));
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [sysModel.site];
      return $q.resolve();
    });
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.resolve(sysModel.site));
    spyOn($rootScope, '$broadcast').and.callThrough();
    spyOn($modalStack, 'getTop').and.returnValue({});
    spyOn($modalStack, 'dismiss');

    controller = $controller('AABuilderMainCtrl as vm', {
      $scope: $scope,
      $stateParams: $stateParams,
      AANotificationService: AANotificationService,
    });
    $scope.$apply();
  }));

  afterEach(function () {
    $state = $rootScope = $modalStack = $q = $compile = $scope = $stateParams = $controller = AAUiModelService = AAModelService = AutoAttendantCeInfoModelService = AutoAttendantCeMenuModelService = AAValidationService = AutoAttendantCeService = AACommonService = DoRestService = AANumberAssignmentService = AANotificationService = HuronConfig = $httpBackend = AAUiScheduleService = AACalendarService = AATrackChangeService = AADependencyService = FeatureToggleService = ServiceSetup = sysModel = timeZone = translatedTimeZone = controller = undefined;
  });

  describe('$locationChangeStart', function () {
    it('should dismiss the modal on click of browser back button', function () {
      $scope.$broadcast('$locationChangeStart');
      $scope.$apply();
      expect($modalStack.getTop).toHaveBeenCalled();
      expect($modalStack.dismiss).toHaveBeenCalled();
    });
  });

  describe('getTimeZoneOptions', function () {
    it('should retrieve the the list of system timezone options', function () {
      controller.ui.timeZoneOptions = undefined;
      controller.getTimeZoneOptions();
      $scope.$apply();
      expect(angular.equals(controller.ui.timeZoneOptions, translatedTimeZone)).toBe(true);
    });
  });

  describe('getSystemTimeZone', function () {
    it('should retrieve the system timezone', function () {
      controller.ui.systemTimeZone = undefined;
      controller.getSystemTimeZone();
      $scope.$apply();
      expect(angular.equals(controller.ui.systemTimeZone, translatedTimeZone[0])).toBe(true);
    });
  });
  describe('getSystemTimeZone - multi site', function () {
    it('should retrieve the system timezone', function () {
      // As of this JIRA - AUTOATTN-1257
      sysModel.site.timeZone = null;

      controller.ui.systemTimeZone = undefined;
      controller.getSystemTimeZone();
      $scope.$apply();
      expect(angular.equals(controller.ui.systemTimeZone, translatedTimeZone[0])).toBe(true);
    });
  });
  describe('getSystemDefaultTimeZone - multi site', function () {
    it('should retrieve the default system timezone', function () {
      var defaultLoc = {
        url: 'https://cmi.huron-int.com/api/v2/customers/9b82a3fa-de82-4ced-a3dd-0989081bd6df/locations/108655a5-899a-4885-9f65-f583b0a76132',
        uuid: '108655a5-899a-4885-9f65-f583b0a76132',
        name: 'Default Location',
        timeZone: 'Twilight/Zone',
        preferredLanguage: 'en_US',
        defaultLocation: true,
        regionCodeDialing: {
          regionCode: null,
          simplifiedNationalDialing: false,
        },
        callerIdNumber: null,
        callerId: null,
      };

      var successSpy = jasmine.createSpy('success');

      spyOn(AACommonService, 'isMultiSiteEnabled').and.returnValue(true);
      spyOn(AutoAttendantLocationService, 'getDefaultLocation').and.returnValue($q.resolve(defaultLoc));
      AutoAttendantLocationService.getDefaultLocation().then(
        successSpy
      );

      controller.getSystemTimeZone();

      $scope.$apply();

      var args = successSpy.calls.mostRecent().args;

      expect(args[0].timeZone).toBe('Twilight/Zone');
    });
  });

  describe('areAssignedResourcesDifferent', function () {
    it('should show no differences', function () {
      var a1 = [{
        id: '408792221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];
      var a2 = [{
        id: '408792221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];

      var ret = controller.areAssignedResourcesDifferent(a1, a2, 'id');

      $scope.$apply();

      expect(ret).toBe(false);
    });

    it('should show a difference', function () {
      var a1 = [{
        id: '40892221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];
      var a2 = [{
        id: '408792221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];

      var ret = controller.areAssignedResourcesDifferent(a1, a2, 'id');

      $scope.$apply();

      expect(ret).toBe(true);
    });
  });

  describe('close', function () {
    it('should invoke clearCeMenuMap to release the associated storage', function () {
      aaModel.aaRecord = undefined;
      controller.close();
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
      expect(AutoAttendantCeMenuModelService.clearCeMenuMap).toHaveBeenCalled();
    });

    it('should warn on CMI assignment failure on close', function () {
      // CMI assignment will fail when there is any bad number in the list
      $httpBackend.when('PUT', HuronConfig.getCmiV2Url() + '/customers/features/autoattendants/uuid/numbers').respond(function (method, url, data) {
        if (JSON.stringify(data).indexOf('bad') > -1) {
          return [500, 'bad'];
        } else {
          return [200, 'good'];
        }
      });

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId('bad');
      resource.setNumber('bad');

      aaModel.aaRecord = _.cloneDeep(aCe);
      aaModel.aaRecord.assignedResources.push(resource);
      aaModel.aaRecordUUID = 'uuid';

      var errorSpy = jasmine.createSpy('error');
      AANotificationService.error = errorSpy;

      controller.close();

      $httpBackend.flush();

      $scope.$apply();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saveAANumberAssignmentWithErrorDetail', function () {
    it('should show error message when assigning number', function () {
      // for an external number query, return the number formatted with a +
      var externalNumberQueryUri = /\/externalnumberpools\?directorynumber=&order=pattern&pattern=(.+)/;
      $httpBackend.whenGET(externalNumberQueryUri)
        .respond(function (method, url) {
          var pattern = decodeURI(url).match(new RegExp(externalNumberQueryUri))[1];

          var response = [{
            pattern: '+' + pattern.replace(/\D/g, ''),
            uuid: pattern.replace(/\D/g, '') + '-id',
          }];

          return [200, response];
        });

      spyOn(AANotificationService, 'errorResponse');
      var resources = {
        workingResources: [],
        failedResources: ['9999999991'],
      };
      spyOn(AANumberAssignmentService, 'setAANumberAssignmentWithErrorDetail').and.returnValue($q.resolve(resources));

      controller.saveAANumberAssignmentWithErrorDetail();

      $scope.$apply();

      expect(AANotificationService.errorResponse).toHaveBeenCalled();
    });
  });

  describe('saveAARecords', function () {
    var createCeSpy;
    var updateCeSpy;
    var updateDoRestSpy;
    var deleteDoRestSpy;
    var nameValidationSpy;
    var aaNameChangedSpy;
    var errorNotificationParams;

    beforeEach(function () {
      createCeSpy = spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.resolve(_.cloneDeep(rawCeInfo)));
      updateCeSpy = spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.resolve(_.cloneDeep(rawCeInfo)));
      updateDoRestSpy = spyOn(DoRestService, 'updateDoRest').and.returnValue($q.resolve(rawCeInfo));
      deleteDoRestSpy = spyOn(DoRestService, 'deleteDoRest').and.returnValue($q.resolve(rawCeInfo));
      spyOn(DoRestService, 'createDoRest').and.returnValue($q.resolve(restBlock));
      spyOn(AANotificationService, 'success');
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');
      spyOn($scope.vm, 'saveUiModel');
      spyOn(AANumberAssignmentService, 'setAANumberAssignment').and.returnValue($q.resolve());

      spyOn(AADependencyService, 'notifyAANameChange');
      aaNameChangedSpy = spyOn(AATrackChangeService, 'isChanged').and.returnValue(false);
      spyOn(AATrackChangeService, 'track');

      nameValidationSpy = spyOn(AAValidationService, 'isNameValidationSuccess').and.returnValue(true);
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      //We don't want a modified copy of aCe from one test to be used in other
      aaModel.aaRecord = _.cloneDeep(aCe);

      errorNotificationParams = { name: 'AAA2', statusText: 'server error', status: 500 };
    });

    afterEach(function () {
      createCeSpy = updateCeSpy = updateDoRestSpy = deleteDoRestSpy = nameValidationSpy = aaNameChangedSpy = errorNotificationParams = undefined;
    });

    it('should save a new aaRecord successfully', function () {
      aaModel.aaRecordUUID = '';
      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(AATrackChangeService.track).toHaveBeenCalled();
      expect(AATrackChangeService.isChanged).not.toHaveBeenCalled();

      expect(AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successCreateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord with one REST block modified and one new REST block (PUT and POST)', function () {
      aaModel.aaRecords.push(rawCeInfo);

      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.updateDoRest).toHaveBeenCalled();
      expect(DoRestService.createDoRest).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      //Check if the REST block id gets updated well in the CE.
      expect(_.get(controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe(restId);
    });

    it('should report failure if an existing aaRecord with REST block modified fails', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      //Explicitly make updateDoRest fail
      updateDoRestSpy.and.returnValue($q.reject({
        statusText: 'server error',
        status: 500,
      }));

      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.updateDoRest).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), errorNotificationParams);
      expect(AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
    });

    it('should report failure if an existing aaRecord with one REST block modified fails but other gets passed', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      updateDoRestSpy.and.returnValues($q.resolve(rawCeInfo), $q.reject({
        statusText: 'server error',
        status: 500,
      }));

      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.updateDoRest).toHaveBeenCalled();
      //We will also see if Save button POSTs the newly created REST block.
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecords.push(rawCeInfo);
      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.createDoRest.calls.count()).toBe(2);
      expect(DoRestService.updateDoRest.calls.count()).toBe(2);
      expect(AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), errorNotificationParams);
    });

    it('should update an existing aaRecord with REST block deleted', function () {
      aaModel.aaRecords.push(rawCeInfo);
      controller.ui.openHours.entries = [
        {
          actions: [{
            id: '',
            name: 'foo',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bar',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bat',
          }],
        },
      ];

      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
    });

    it('should report failure if REST block does not get deleted successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);
      controller.ui.openHours.entries = [
        {
          actions: [{
            id: '',
            name: 'foo',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bar',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bat',
          }],
        },
      ];
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      DoRestService.deleteDoRest.and.returnValue($q.reject({
        statusText: 'server error',
        status: 500,
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), errorNotificationParams);
    });

    it('should report failure if one of the REST blocks does not get deleted successfully but the other does', function () {
      aaModel.aaRecords.push(rawCeInfo);

      controller.ui.openHours.entries = [
        {
          actions: [{
            id: '',
            name: 'foo',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bar',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bat',
          }],
        },
      ];
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      deleteDoRestSpy.and.returnValues($q.resolve(rawCeInfo), $q.reject({
        statusText: 'server error',
        status: 500,
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), errorNotificationParams);
    });

    it('should not report failure if REST block does not get deleted successfully with a 404', function () {
      aaModel.aaRecords.push(rawCeInfo);
      controller.ui.openHours.entries = [
        {
          actions: [{
            id: '',
            name: 'foo',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bar',
          }],
        },
        {
          actions: [{
            id: '',
            name: 'bat',
          }],
        },
      ];
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      deleteDoRestSpy.and.returnValue($q.reject({
        statusText: 'server error',
        status: 404,
      }));
      controller.saveAARecords();
      $scope.$apply();
      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).not.toHaveBeenCalled();
    });

    it('should report failure if AutoAttendantCeService.createCe() failed', function () {
      aaModel.aaRecordUUID = '';
      createCeSpy.and.returnValue($q.reject({
        statusText: 'server error',
        status: 500,
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(AATrackChangeService.track).not.toHaveBeenCalled();
      expect(AATrackChangeService.isChanged).not.toHaveBeenCalled();

      expect(AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should update an existing aaRecord successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      // if AA Name is not changed, don't call AADependencyService.notifyAANameChange()
      expect(AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(AATrackChangeService.track).not.toHaveBeenCalled();

      expect(AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord successfully in non-REST api toggled tenants too', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(false);

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toBe(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toBe(true);

      // if AA Name is not changed, don't call AADependencyService.notifyAANameChange()
      expect(AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(AATrackChangeService.track).not.toHaveBeenCalled();

      expect(AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord with AA Name changed successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      // Assume aaName is changed.
      aaNameChangedSpy.and.returnValue(true);

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      // if AA Name is changed, call AADependencyService.notifyAANameChange()
      expect(AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).toHaveBeenCalled();
      expect(AATrackChangeService.track).toHaveBeenCalled();

      expect(AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should report failure if AutoAttendantCeService.updateCe() failed', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      updateCeSpy.and.returnValue($q.reject({
        statusText: 'server error',
        status: 500,
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should not save when there is a name validation error', function () {
      nameValidationSpy.and.returnValue(false);

      controller.saveAARecords();

      expect($scope.vm.saveUiModel).not.toHaveBeenCalled();
    });
  });

  describe('selectAA', function () {
    var readCe;
    var readDoRestSpy;

    beforeEach(function () {
      readCe = spyOn(AutoAttendantCeService, 'readCe').and.returnValue($q.resolve(_.cloneDeep(aCe)));
      readDoRestSpy = spyOn(DoRestService, 'readDoRest').and.returnValue($q.resolve(doRest));
      spyOn($scope.vm, 'populateUiModel');
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');
      spyOn(AAModelService, 'getNewAARecord').and.callThrough();
      spyOn(AADependencyService, 'notifyAANameChange');
      spyOn(AATrackChangeService, 'isChanged');
      spyOn(AATrackChangeService, 'track');
    });

    afterEach(function () {
      readCe = readDoRestSpy = undefined;
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined', function () {
      $scope.vm.aaModel = {};
      controller.selectAA('');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();

      // AAName is not tracked yet when opening new AA
      expect(AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(AATrackChangeService.track).not.toHaveBeenCalled();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is empty', function () {
      $scope.vm.aaModel = {};
      $scope.vm.templateName = '';
      controller.selectAA('');
      $scope.$apply();
      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is set', function () {
      $scope.vm.aaModel = {};

      controller.selectAA('');
      $scope.$apply();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should be able to read an existing new aaRecord successfully when no name is given', function () {
      // when aaModel.aaRecord is defined
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      controller.selectAA('');
      $scope.$apply();

      // $scope.vm.aaModel should not be initialized again with a new AARecord
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();

      expect($scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a name is given', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();

      expect($scope.vm.aaModel.aaRecord.callExperienceName).toEqual(aCe.callExperienceName);
      expect($scope.vm.populateUiModel).toHaveBeenCalled();

      // start tracking AAName when reading an existing aaRecord
      expect(AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(AATrackChangeService.track).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully on a non-RESTAPI toggled tenant when a name is given', function () {
      controller.aaModel = {};
      controller.aaModel.aaRecords = ces;
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(false);
      controller.selectAA('AA2');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();

      expect(_.get(controller.aaModel.aaRecord, 'callExperienceName')).toBe(aCe.callExperienceName);
      expect(controller.populateUiModel).toHaveBeenCalled();

      // start tracking AAName when reading an existing aaRecord
      expect(_.get(controller.aaModel, 'aaRecords').length).toBe(3);
      expect(AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(AATrackChangeService.track).toHaveBeenCalled();
    });

    it('should return error when the backend return 500 error', function () {
      readCe.and.returnValue(
        $q.reject({
          status: 500,
        })
      );
      controller.aaModel = {};
      controller.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(controller.populateUiModel).not.toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a REST block is already there', function () {
      readCe.and.returnValue($q.resolve(aCe));
      controller.aaModel = {};
      controller.aaModel.aaRecords = ces;
      expect(_.get(controller.aaModel, 'aaRecords').length).toBe(3);
      controller.selectAA('AAA3');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();
      expect(DoRestService.readDoRest).toHaveBeenCalled();
      expect(controller.populateUiModel).toHaveBeenCalled();
      expect(_.get(controller.aaModel.aaRecord.actionSets[0], 'actions').length).toBe(4);
      expect(_.get(controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe('fca066b1-4938-4b5f-9870-9e66ad17e0a2');
    });

    it('should return an error when an existing REST block read gets errored', function () {
      readCe.and.returnValue($q.resolve(aCe));
      readDoRestSpy.and.returnValue(
        $q.reject({
          status: 500,
        })
      );
      controller.aaModel = {};
      controller.aaModel.aaRecords = ces;
      controller.selectAA('AAA3');
      $scope.$apply();
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(controller.populateUiModel).toHaveBeenCalled();
    });

    it('should return an error when one REST block gets successfully read but other REST block read gets errored', function () {
      readCe.and.returnValue($q.resolve(aCe));
      readDoRestSpy.and.returnValues($q.resolve(doRest),
        $q.reject({
          status: 500,
        })
      );
      controller.aaModel = {};
      controller.aaModel.aaRecords = ces;
      controller.selectAA('AAA3');
      $scope.$apply();
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(controller.populateUiModel).toHaveBeenCalled();
      expect(_.get(controller.aaModel.aaRecord.actionSets[0], 'actions').length).toBe(4);
      expect(_.get(controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe('fca066b1-4938-4b5f-9870-9e66ad17e0a2');
    });
  });

  describe('setupTemplate', function () {
    beforeEach(function () {
      spyOn(AANotificationService, 'success');
      spyOn(AANotificationService, 'error');
    });

    it('should set up a say PhoneMenu open hours template using real template1', function () {
      $scope.vm.templateName = 'Basic';
      controller.setupTemplate();

      expect($scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('play');
      expect($scope.vm.ui.openHours['entries'][1]['type']).toEqual('MENU_OPTION');

      expect($scope.vm.ui.openHours['entries'][1]['entries'].length).toEqual(1);
      expect($scope.vm.ui.openHours['entries'][1]['entries'][0]['type']).toEqual('MENU_OPTION');
      expect($scope.vm.ui.openHours['entries'][1]['entries'][0]['key']).toEqual('0');
      expect($scope.vm.ui.openHours['entries'][1]['entries'][0]['actions'].length).toEqual(1);

      expect($scope.vm.ui.isOpenHours).toEqual(true);
    });

    it('should set up a say say say open hours template using test template', function () {
      $scope.vm.templateDefinitions = [{
        tname: 'template2',
        actions: [{
          lane: 'openHours',
          actionset: ['play3', 'play4', 'play5'],
        }],
      }];
      $scope.vm.templateName = 'template2';
      controller.setupTemplate();
      expect($scope.vm.ui.openHours['entries'].length).toEqual(3);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('play3');
      expect($scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('play4');
      expect($scope.vm.ui.openHours['entries'][2]['actions'][0]['name']).toEqual('play5');
      expect($scope.vm.ui.isOpenHours).toEqual(true);
    });

    it('should set up a say say open hours - say closed hours template', function () {
      $scope.vm.templateDefinitions = [{
        tname: 'template3',
        actions: [{
          lane: 'openHours',
          actionset: ['playOpen1', 'playOpen2'],
        }, {
          lane: 'closedHours',
          actionset: ['playClosed1'],
        }],
      }];
      $scope.vm.templateName = 'template3';
      controller.setupTemplate();

      expect($scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('playOpen1');
      expect($scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('playOpen2');
      expect($scope.vm.ui.closedHours['entries'].length).toEqual(1);
      expect($scope.vm.ui.closedHours['entries'][0]['actions'][0]['name']).toEqual('playClosed1');
      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(false);
    });

    it('should fail to create template since template name is not valid', function () {
      $scope.vm.templateName = 'templateDoesNotExist';
      controller.setupTemplate();

      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplate', jasmine.any(Object)
      );
    });

    it('should fail to create template since template has no actions', function () {
      $scope.vm.templateDefinitions = [{
        tname: 'templateNoActions',
      }];

      $scope.vm.templateName = 'templateNoActions';
      controller.setupTemplate();

      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplateDef', jasmine.any(Object)
      );
    });

    it('should fail to create template since template has no action set in closedHours lane', function () {
      $scope.vm.templateDefinitions = [{
        tname: 'templateMissingActionSet',
        actions: [{
          lane: 'openHours',
          actionset: ['playOpen1', 'playOpen2'],
        }, {
          lane: 'closedHours',
        }],
      }];

      $scope.vm.templateName = 'templateMissingActionSet';
      controller.setupTemplate();

      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplateDef', jasmine.any(Object)
      );
    });

    it('should NOT display add step icons on aa-builder-lane', function () {
      $rootScope.schedule = 'openHours';
      $rootScope.index = 0;
      element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);

      $rootScope.$digest();
      expect(element.find('aa-panel').hasClass('ng-show')).toBe(false);
      expect(element.find('aa-new-step-info').hasClass('ng-show')).toBe(false);
    });

    it('should NOT display add step icons on aa-builder-actions', function () {
      $rootScope.schedule = 'openHours';
      $rootScope.index = 0;
      element = $compile('<aa-builder-actions></aa-builder-actions>')($rootScope);

      $rootScope.$digest();
      expect(element.find('aa-panel').hasClass('ng-show')).toBe(false);
      expect(element.find('aa-panel-body').hasClass('ng-show')).toBe(false);
      expect(element.find('aa-action-delete').hasClass('ng-show')).toBe(false);
    });

    // TODO:SIMPLETEMPLATE Should also verify that delete steps are not shown
  });

  describe('populateUiModel', function () {
    it('should initialize new openHours, closedHours and holidays menus successfully if they do not exist', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = aCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(true);
    });

    it('should build openHours, closedHours and holidays menus successfully from model', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = a3LaneCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(true);
    });
  });

  describe('saveUiModel', function () {
    beforeEach(function () {
      spyOn(AutoAttendantCeInfoModelService, 'setCeInfo');
      spyOn(AutoAttendantCeMenuModelService, 'updateCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'deleteCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'newCeMenu').and.callThrough();
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = ce2CeInfo(rawCeInfo);
      $scope.vm.ui.builder = {};
      $scope.vm.ui.builder.ceInfo_name = 'AAA2';
    });

    it('should write UI CeInfo into model', function () {
      controller.saveUiModel();

      expect(AutoAttendantCeInfoModelService.setCeInfo).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, $scope.vm.ui.ceInfo);
    });

    it('should write openHours menu into model', function () {
      $scope.vm.ui.isOpenHours = true;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidayss = false;
      $scope.vm.ui.openHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'openHours', $scope.vm.ui.openHours);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours');
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write closedHours menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = true;
      $scope.vm.ui.isHolidays = false;
      $scope.vm.ui.closedHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours', $scope.vm.ui.closedHours);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write holidays menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidays = true;
      $scope.vm.ui.holidays = {};
      $scope.vm.ui.holidaysValue = 'closedHours';
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays', $scope.vm.ui.holidays, $scope.vm.ui.holidaysValue);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours');
    });
  });

  describe('setAANameFocus', function () {
    it('should set model aaNameFocus variable to true', function () {
      $scope.vm.aaNameFocus = 'false';
      controller.setAANameFocus();

      expect($scope.vm.aaNameFocus).toEqual(true);
    });
  });

  describe('removeNewStep', function () {
    it('should remove all New Step placeholders from a menu', function () {
      expect(menuWithNewStep.entries.length).toEqual(4);
      controller.removeNewStep(menuWithNewStep);
      expect(menuWithNewStep.entries.length).toEqual(2);
    });
  });

  describe('save8To5Schedule', function () {
    var createScheduleDefer;
    var saveAARecordDefer;

    beforeEach(function () {
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = {};
      $scope.vm.ui.builder = {};
      $scope.vm.ui.builder.ceInfo_name = 'AA';

      createScheduleDefer = $q.defer();
      saveAARecordDefer = $q.defer();
      spyOn(AAUiScheduleService, 'create8To5Schedule').and.returnValue(createScheduleDefer.promise);
      spyOn(controller, 'saveAARecords').and.returnValue(saveAARecordDefer.promise);
      spyOn(AANotificationService, 'errorResponse');
    });

    it('should return and resolve a promise when successfully save a 8to5 schedule', function () {
      var saveSchedulePromise = controller.save8To5Schedule('AA');

      var promiseResolved = false;
      saveSchedulePromise.then(function () {
        promiseResolved = true;
      });
      createScheduleDefer.resolve('12345');

      expect(promiseResolved).toBe(false);
      expect($scope.vm.ui.ceInfo.scheduleId).toBeUndefined();

      $rootScope.$apply();

      expect(promiseResolved).toBe(true);
      expect($scope.vm.ui.ceInfo.scheduleId).toBe('12345');
    });

    it('should return and reject a promise when failed to save a 8to5 schedule', function () {
      var saveSchedulePromise = controller.save8To5Schedule('AA');

      var errorText = '';
      saveSchedulePromise.catch(function (error) {
        errorText = error;
      });
      createScheduleDefer.reject({
        name: 'AA',
        statusText: 'Server Error',
        status: '500',
      });

      expect(errorText).toBe('');

      $rootScope.$apply();

      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(errorText).toBe('SAVE_SCHEDULE_FAILURE');
    });
  });

  describe('saveCeDefinition', function () {
    var saveAARecordDefer;

    beforeEach(function () {
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = {};
      $scope.vm.ui.builder = {};
      $scope.vm.isAANameDefined = false;

      saveAARecordDefer = $q.defer();
      spyOn(controller, 'saveAARecords').and.returnValue(saveAARecordDefer.promise);
    });

    it('should return and resolve a promise when successfully save a CE Definition', function () {
      var saveCeDefinitionPromise = controller.saveCeDefinition();

      var promiseResolved = false;
      saveCeDefinitionPromise.then(function () {
        promiseResolved = true;
      });
      saveAARecordDefer.resolve();

      expect(promiseResolved).toBe(false);
      expect($scope.vm.isAANameDefined).toBe(false);

      $rootScope.$apply();

      expect(promiseResolved).toBe(true);
      expect($scope.vm.isAANameDefined).toBe(true);
    });

    it('should return and reject a promise when failed to save a CE Definition', function () {
      var saveCeDefinitionPromise = controller.saveCeDefinition();

      var errorText = '';
      saveCeDefinitionPromise.catch(function (error) {
        errorText = error;
      });
      saveAARecordDefer.reject();

      expect(errorText).toBe('');

      $rootScope.$apply();

      expect(errorText).toBe('CE_SAVE_FAILURE');
    });
  });

  describe('delete9To5Schedule', function () {
    var deleteCalendarDefer;

    beforeEach(function () {
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = {};
      $scope.vm.ui.builder = {};
      $scope.vm.isAANameDefined = false;

      deleteCalendarDefer = $q.defer();
      spyOn(AACalendarService, 'deleteCalendar').and.returnValue(deleteCalendarDefer.promise);
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');
    });

    it('should delete the predefined 9 to 5 schedule when there is a CE_SAVE_FAILURE', function () {
      controller.delete8To5Schedule('CE_SAVE_FAILURE');
      deleteCalendarDefer.resolve();

      $rootScope.$apply();

      expect(AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should display an error info when failed to delete a calendar', function () {
      controller.delete8To5Schedule('CE_SAVE_FAILURE');
      deleteCalendarDefer.reject();

      $rootScope.$apply();

      expect(AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should do nothing when there is a SAVE_SCHEDULE_FAILURE', function () {
      controller.delete8To5Schedule('SAVE_SCHEDULE_FAILURE');

      $rootScope.$apply();

      expect(AACalendarService.deleteCalendar).not.toHaveBeenCalled();
    });
  });

  describe('Received AANameCreated Event', function () {
    var saveAARecordDefer;
    var save8To5ScheduleDefer;
    var saveCeDefinitionDefer;

    beforeEach(function () {
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = {};
      $scope.vm.ui.builder = {};
      $scope.vm.ui.aaTemplate = 'BusinessHours';
      $scope.vm.ui.builder.ceInfo_name = 'AA';
      $scope.vm.isAANameDefined = false;

      saveAARecordDefer = $q.defer();
      save8To5ScheduleDefer = $q.defer();
      saveCeDefinitionDefer = $q.defer();

      spyOn(controller, 'saveAARecords').and.returnValue(saveAARecordDefer.promise);

      spyOn(controller, 'save8To5Schedule').and.returnValue(save8To5ScheduleDefer.promise);
      spyOn(controller, 'saveCeDefinition').and.returnValue(saveCeDefinitionDefer.promise);
      spyOn(controller, 'delete8To5Schedule');
    });

    it('should save a 8to5 schedule and save current CE definition for BusinessHours creation.', function () {
      $rootScope.$broadcast('AANameCreated');
      save8To5ScheduleDefer.resolve();
      saveCeDefinitionDefer.resolve();

      $rootScope.$apply();

      expect(controller.save8To5Schedule).toHaveBeenCalled();
      expect(controller.saveCeDefinition).toHaveBeenCalled();
      expect(controller.delete8To5Schedule).not.toHaveBeenCalled();
    });

    it('should invoke saveAARecords for Basic template creation', function () {
      $scope.vm.ui.aaTemplate = 'Basic';
      $rootScope.$broadcast('AANameCreated');
      saveAARecordDefer.resolve();

      $rootScope.$apply();

      expect(controller.saveAARecords).toHaveBeenCalled();
      expect($scope.vm.isAANameDefined).toBe(true);
    });

    it('should invoke saveAARecords for Custom template creation', function () {
      $scope.vm.ui.aaTemplate = '';
      $rootScope.$broadcast('AANameCreated');
      saveAARecordDefer.resolve();

      $rootScope.$apply();

      expect(controller.saveAARecords).toHaveBeenCalled();
      expect($scope.vm.isAANameDefined).toBe(true);
    });

    it('should undo the 8to5 schedule save if save current CE definition failed.', function () {
      $rootScope.$broadcast('AANameCreated');
      save8To5ScheduleDefer.resolve();
      saveCeDefinitionDefer.reject();

      $rootScope.$apply();

      expect(controller.save8To5Schedule).toHaveBeenCalled();
      expect(controller.saveCeDefinition).toHaveBeenCalled();
      expect(controller.delete8To5Schedule).toHaveBeenCalled();
    });

    it('should invoke delete8To5Schedule but do nothing if fail to save the 9 to 5 schedule.', function () {
      $rootScope.$broadcast('AANameCreated');
      save8To5ScheduleDefer.reject();

      $rootScope.$apply();

      expect(controller.save8To5Schedule).toHaveBeenCalled();
      expect(controller.saveCeDefinition).not.toHaveBeenCalled();
      expect(controller.delete8To5Schedule).toHaveBeenCalled();
    });
  });
});
