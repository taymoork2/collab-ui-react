'use strict';

describe('Controller: AABuilderMainCtrl', function () {
  beforeEach(function () {
    this.initModules('uc.autoattendant', 'Huron', 'Sunlight');
    this.injectDependencies(
      '$compile',
      '$controller',
      '$httpBackend',
      '$modalStack',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      '$stateParams',
      'AACalendarService',
      'AACommonService',
      'AADependencyService',
      'AAModelService',
      'AANotificationService',
      'AANumberAssignmentService',
      'AARestModelService',
      'AATrackChangeService',
      'AAUiModelService',
      'AAUiScheduleService',
      'AAValidationService',
      'Authinfo',
      'AutoAttendantCeInfoModelService',
      'AutoAttendantCeMenuModelService',
      'AutoAttendantLocationService',
      'AutoAttendantCeService',
      'DoRestService',
      'FeatureToggleService',
      'HuronConfig',
      'ServiceSetup'
    );

    // JSON Files
    this.ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
    this.aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
    this.doRest = getJSONFixture('huron/json/autoAttendant/doRest.json');
    this.doRestWithoutCredentials = getJSONFixture('huron/json/autoAttendant/doRestWithoutCredentials.json');
    this.a3LaneCe = getJSONFixture('huron/json/autoAttendant/a3LaneCe.json');
    this.combinedMenus = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');

    // setting service data/variables
    this.$stateParams.aaName = '';
    this.$scope.$dismiss = function () {
      return true;
    };

    this.sysModel = {
      site: {
        uuid: '777-888-666',
        steeringDigit: '5',
        siteSteeringDigit: '6',
        siteCode: '200',
        voicemailPilotNumber: '+16506679080',
        timeZone: 'America/Los_Angeles',
      },
    };
    this.timeZone = [{
      id: 'America/Los_Angeles',
      label: 'America/Los_Angeles',
    }];
    this.translatedTimeZone = [{
      id: 'America/Los_Angeles',
      label: 'timeZones.America/Los_Angeles',
    }];

    this.aaModel = {};
    this.restId = 'fca066b1-4938-4b5f-9870-9e66ad17e0a2';
    this.uiRestBlocks = {};
    this.uiRestBlocks[this.restId] = {
      method: 'GET',
      url: 'test URL',
      responseActions: [{
        assignVar: {
          variableName: 'test var3',
          value: 'res3',
        },
      }],
    };
    this.uiRestBlocks['TEMP_0'] = {
      method: 'GET',
      url: 'test URL3',
      username: 'testUser',
      password: 'testPassword',
      responseActions: [{
        assignVar: {
          variableName: 'test var',
          value: 'res',
        },
      }],
    };

    this.rawCeInfo = {
      callExperienceName: 'AAA2',
      callExperienceURL: 'https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b',
      assignedResources: [{
        id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
        number: '1111111',
        type: 'directoryNumber',
        trigger: 'incomingCall',
        uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
      }],
    };
    this.restBlock = {
      restConfigUrl: 'https://ces.hitest.huron-dev.com/api/v1/rest/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/restConfigs/89c76add-0e5d-48fe-9a4c-36aa201ec8ae',
    };

    this.restBlocks = {};
    this.restBlocks['abc066b1-4938-4b5f-9870-9e66ad17edef'] = {
      method: 'GET',
      url: 'test URL2',
      responseActions: [{
        assignVar: {
          variableName: 'test var2',
          value: 'res2',
        },
      }],
    };
    this.restBlocks['abc066b2-3938-445f-9870-9e66ad17edef'] = {
      method: 'GET',
      url: 'test URL23',
      responseActions: [{
        assignVar: {
          variableName: 'test var23',
          value: 'res23',
        },
      }],
    };

    // Spies
    spyOn(this.$state, 'go');
    spyOn(this.AAModelService, 'getAAModel').and.returnValue(this.aaModel);
    spyOn(this.AAUiModelService, 'initUiModel');
    spyOn(this.AARestModelService, 'getRestBlocks').and.returnValue(this.restBlocks);
    spyOn(this.AARestModelService, 'getUiRestBlocks').and.returnValue(this.uiRestBlocks);
    spyOn(this.AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue(this.$q.resolve(this.$stateParams.aaName));
    spyOn(this.AutoAttendantCeMenuModelService, 'clearCeMenuMap');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.ServiceSetup, 'getTimeZones').and.returnValue(this.$q.resolve(this.timeZone));
    spyOn(this.ServiceSetup, 'listSites').and.callFake(function () {
      this.ServiceSetup.sites = [this.sysModel.site];
      return this.$q.resolve();
    });
    spyOn(this.ServiceSetup, 'getSite').and.returnValue(this.$q.resolve(this.sysModel.site));
    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    spyOn(this.$modalStack, 'getTop').and.returnValue({});
    spyOn(this.$modalStack, 'dismiss');

    // mock element
    this.elem = {
      find: jasmine.createSpy('find').and.returnValue({ focus: _.noop }),
    };

    this.controller = this.$controller('AABuilderMainCtrl as vm', {
      $element: this.elem,
      $scope: this.$scope,
      $stateParams: this.$stateParams,
      AANotificationService: this.AANotificationService,
    });
    this.$scope.$apply();

    // Functions
    this.ce2CeInfo = function () {
      var _ceInfo = this.AutoAttendantCeInfoModelService.newCeInfo();
      for (var j = 0; j < this.rawCeInfo.assignedResources.length; j++) {
        var _resource = this.AutoAttendantCeInfoModelService.newResource();
        _resource.setId(this.rawCeInfo.assignedResources[j].id);
        _resource.setTrigger(this.rawCeInfo.assignedResources[j].trigger);
        _resource.setType(this.rawCeInfo.assignedResources[j].type);
        _resource.setUUID(this.rawCeInfo.assignedResources[j].uuid);
        if (!_.isUndefined(this.rawCeInfo.assignedResources[j].number)) {
          _resource.setNumber(this.rawCeInfo.assignedResources[j].number);
        }
        _ceInfo.addResource(_resource);
      }
      _ceInfo.setName(this.rawCeInfo.callExperienceName);
      _ceInfo.setCeUrl(this.rawCeInfo.callExperienceURL);
      return _ceInfo;
    };
  });

  describe('$locationChangeStart', function () {
    it('should dismiss the modal on click of browser back button', function () {
      this.$scope.$broadcast('$locationChangeStart');
      this.$scope.$apply();
      expect(this.$modalStack.getTop).toHaveBeenCalled();
      expect(this.$modalStack.dismiss).toHaveBeenCalled();
    });
  });

  describe('getTimeZoneOptions', function () {
    it('should retrieve the the list of system timezone options', function () {
      this.controller.ui.timeZoneOptions = undefined;
      this.controller.getTimeZoneOptions();
      this.$scope.$apply();
      expect(this.controller.ui.timeZoneOptions).toEqual(this.translatedTimeZone);
    });
  });

  describe('getSystemTimeZone', function () {
    it('should retrieve the system timezone', function () {
      this.controller.ui.systemTimeZone = undefined;
      this.controller.getSystemTimeZone();
      this.$scope.$apply();
      expect(this.controller.ui.systemTimeZone).toEqual(this.translatedTimeZone[0]);
    });
  });

  describe('getSystemTimeZone - multi site', function () {
    it('should retrieve the system timezone', function () {
      // As of this JIRA - AUTOATTN-1257
      this.sysModel.site.timeZone = null;

      this.controller.ui.systemTimeZone = undefined;
      this.controller.getSystemTimeZone();
      this.$scope.$apply();
      expect(this.controller.ui.systemTimeZone).toEqual(this.translatedTimeZone[0]);
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

      spyOn(this.AACommonService, 'isMultiSiteEnabled').and.returnValue(true);
      spyOn(this.AutoAttendantLocationService, 'getDefaultLocation').and.returnValue(this.$q.resolve(defaultLoc));
      this.AutoAttendantLocationService.getDefaultLocation().then(successSpy);
      this.AANotificationService.error = jasmine.createSpy('error');

      this.controller.getSystemTimeZone();
      this.$scope.$apply();

      var args = successSpy.calls.mostRecent().args;
      expect(args[0].timeZone).toBe(defaultLoc.timeZone);
    });

    it('populateRouitngPrefix', function () {
      var locationList = {
        uuid: 'abc',
        name: 'testLocation1',
        locations: [{ routingPrefix: '6100' }],
        defaultLocation: 'false',
        userCount: 'null',
        placeCount: 'null',
        url: 'https://cmi.huron-int.com/api/v2/customers/abc/locations/abc',
      };
      spyOn(this.AACommonService, 'isMultiSiteEnabled').and.returnValue(true);
      spyOn(this.AutoAttendantLocationService, 'listLocations').and.returnValue(this.$q.resolve(locationList));
      this.controller.populateRoutingLocation();
      this.$scope.$apply();
      expect(this.controller.ui.routingPrefixOptions).toEqual(['6100']);
    });
  });

  describe('Error Notification for while populating routing locations', function () {
    it('populateRoutingLocation', function () {
      var successSpy = jasmine.createSpy('success');
      spyOn(this.AACommonService, 'isMultiSiteEnabled').and.returnValue(true);
      spyOn(this.AutoAttendantLocationService, 'listLocations').and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      this.AutoAttendantLocationService.getDefaultLocation().then(
        successSpy
      );
      this.AANotificationService.error = jasmine.createSpy('error');

      this.controller.populateRoutingLocation();
      this.$scope.$apply();
      expect(this.AANotificationService.error).toHaveBeenCalled();
    });
  });

  describe('areAssignedResourcesDifferent', function () {
    beforeEach(function () {
      this.a1 = [{
        id: '408792221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];
      this.a2 = [{
        id: '40892221',
      }, {
        id: '4087963542',
      }, {
        id: '40872655',
      }];
    });

    it('should show no differences', function () {
      var ret = this.controller.areAssignedResourcesDifferent(this.a1, this.a1, 'id');
      this.$scope.$apply();
      expect(ret).toBeFalsy();
    });

    it('should show a difference', function () {
      var ret = this.controller.areAssignedResourcesDifferent(this.a1, this.a2, 'id');
      this.$scope.$apply();
      expect(ret).toBeTruthy();
    });
  });

  describe('close', function () {
    it('should invoke clearCeMenuMap to release the associated storage', function () {
      this.aaModel.aaRecord = undefined;
      this.controller.close();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.AutoAttendantCeMenuModelService.clearCeMenuMap).toHaveBeenCalled();
    });

    it('should warn on CMI assignment failure on close', function () {
      // CMI assignment will fail when there is any bad number in the list
      this.$httpBackend.when('PUT', this.HuronConfig.getCmiV2Url() + '/customers/features/autoattendants/uuid/numbers').respond(function (method, url, data) {
        if (JSON.stringify(data).indexOf('bad') > -1) {
          return [500, 'bad'];
        } else {
          return [200, 'good'];
        }
      });

      var resource = this.AutoAttendantCeInfoModelService.newResource();
      resource.setType(this.aCe.assignedResources.type);
      resource.setId('bad');
      resource.setNumber('bad');

      this.aaModel.aaRecord = _.cloneDeep(this.aCe);
      this.aaModel.aaRecord.assignedResources.push(resource);
      this.aaModel.aaRecordUUID = 'uuid';

      this.AANotificationService.error = jasmine.createSpy('error');

      this.controller.close();
      this.$httpBackend.flush();
      this.$scope.$apply();

      expect(this.AANotificationService.error).toHaveBeenCalled();
    });
    it('should unassign Assigned and reAssign with new uuid', function () {
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('cuid');

      this.$httpBackend.when('PUT', this.HuronConfig.getCmiV2Url() + '/customers/cuid/features/autoattendants/uuid/numbers').respond(function () {
        return [200, 'good'];
      });

      this.$httpBackend.when('GET', this.HuronConfig.getCmiV2Url() + '/customers/cuid/features/autoattendants/uuid/numbers').respond(function () {
        return [200, { numbers: [{ number: '1111111', uuid: 'newUUID' }] }];
      });

      var resource = this.AutoAttendantCeInfoModelService.newResource();
      resource.setType(this.aCe.assignedResources.type);
      resource.setId('1111111');
      resource.setNumber('1111111');

      this.aaModel.aaRecord = _.cloneDeep(this.aCe);

      this.aaModel.aaRecordUUID = 'uuid';

      this.controller.ui.ceInfo.addResource({ id: '33333333' });
      this.controller.close();

      this.$httpBackend.flush();

      this.$scope.$apply();

      expect(this.aaModel.aaRecord.assignedResources[0].uuid).toEqual('newUUID');
    });
    it('should unassign Assigned and reAssign same number with new uuid', function () {
        spyOn(this.Authinfo, 'getOrgId').and.returnValue('cuid');

        this.$httpBackend.when('PUT', this.HuronConfig.getCmiV2Url() + '/customers/cuid/features/autoattendants/uuid/numbers').respond(function () {
          return [200, 'good'];
        });

        this.$httpBackend.when('GET', this.HuronConfig.getCmiV2Url() + '/customers/cuid/features/autoattendants/uuid/numbers').respond(function () {
          return [200, { numbers: [{ number: '1111111', uuid: '21799279-2529-4358-ab2f-1e46bfc3684b' }] }];
        });

        var resource = this.AutoAttendantCeInfoModelService.newResource();
        resource.setType(this.aCe.assignedResources.type);
        resource.setUUID('00097a86-45ef-44a7-aa78-6d32a0ca1d3b');
        resource.setId('1111111');
        resource.setNumber('1111111');

        this.aaModel.aaRecord = _.cloneDeep(this.aCe);

        this.aaModel.aaRecordUUID = 'uuid';

        this.controller.ui.ceInfo.addResource({ id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b', uuid: '21799279-2529-4358-ab2f-1e46bfc3684b' });
        this.controller.close();

        this.$httpBackend.flush();

        this.$scope.$apply();

        expect(_.get(this.aaModel.aaRecord, 'assignedResources[0].uuid', 'undefined')).toBe('21799279-2529-4358-ab2f-1e46bfc3684b');
      });
  });

  describe('saveAANumberAssignmentWithErrorDetail', function () {
    it('should show error message when assigning number', function () {
      // for an external number query, return the number formatted with a +
      var externalNumberQueryUri = /\/externalnumberpools\?directorynumber=&order=pattern&pattern=(.+)/;
      this.$httpBackend.whenGET(externalNumberQueryUri)
        .respond(function (method, url) {
          var pattern = decodeURI(url).match(new RegExp(externalNumberQueryUri))[1];

          var response = [{
            pattern: '+' + pattern.replace(/\D/g, ''),
            uuid: pattern.replace(/\D/g, '') + '-id',
          }];

          return [200, response];
        });

      spyOn(this.AANotificationService, 'errorResponse');
      var resources = {
        workingResources: [],
        failedResources: ['9999999991'],
      };
      spyOn(this.AANumberAssignmentService, 'setAANumberAssignmentWithErrorDetail').and.returnValue(this.$q.resolve(resources));

      this.controller.saveAANumberAssignmentWithErrorDetail();
      this.$scope.$apply();

      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
    });
  });

  describe('saveAARecords', function () {
    beforeEach(function () {
      this.createCeSpy = spyOn(this.AutoAttendantCeService, 'createCe').and.returnValue(this.$q.resolve(_.cloneDeep(this.rawCeInfo)));
      this.updateCeSpy = spyOn(this.AutoAttendantCeService, 'updateCe').and.returnValue(this.$q.resolve(_.cloneDeep(this.rawCeInfo)));
      this.updateDoRestSpy = spyOn(this.DoRestService, 'updateDoRest').and.returnValue(this.$q.resolve(this.rawCeInfo));
      this.deleteDoRestSpy = spyOn(this.DoRestService, 'deleteDoRest').and.returnValue(this.$q.resolve(this.rawCeInfo));
      spyOn(this.DoRestService, 'createDoRest').and.returnValue(this.$q.resolve(this.restBlock));
      spyOn(this.AANotificationService, 'success');
      spyOn(this.AANotificationService, 'error');
      spyOn(this.AANotificationService, 'errorResponse');
      spyOn(this.$scope.vm, 'saveUiModel');
      spyOn(this.AANumberAssignmentService, 'setAANumberAssignment').and.returnValue(this.$q.resolve());

      spyOn(this.AADependencyService, 'notifyAANameChange');
      this.aaNameChangedSpy = spyOn(this.AATrackChangeService, 'isChanged').and.returnValue(false);
      spyOn(this.AATrackChangeService, 'track');

      this.nameValidationSpy = spyOn(this.AAValidationService, 'isNameValidationSuccess').and.returnValue(true);
      this.aaModel.ceInfos = [];
      this.aaModel.aaRecords = [];
      //We don't want a modified copy of aCe from one test to be used in other
      this.aaModel.aaRecord = _.cloneDeep(this.aCe);

      this.errorNotificationParams = { name: 'AAA2', statusText: 'server error', status: 500 };

      this.openHourEntries = [{
        actions: [{
          id: '',
          name: 'foo',
        }],
      }, {
        actions: [{
          id: '',
          name: 'bar',
        }],
      }, {
        actions: [{
          id: '',
          name: 'bat',
        }],
      }];
    });

    it('should save a new aaRecord successfully', function () {
      this.aaModel.aaRecordUUID = '';
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(this.aaModel.aaRecords[0]).toEqual(this.rawCeInfo);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = this.ce2CeInfo();
      expect(this.aaModel.ceInfos[0]).toEqual(ceInfo);

      expect(this.AATrackChangeService.track).toHaveBeenCalled();
      expect(this.AATrackChangeService.isChanged).not.toHaveBeenCalled();

      expect(this.AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successCreateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord with one REST block modified and one new REST block (PUT and POST)', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);

      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.updateDoRest).toHaveBeenCalled();
      expect(this.DoRestService.createDoRest).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();

      //Check if the REST block id gets updated well in the CE.
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe(this.restId);
    });

    it('should report failure if an existing aaRecord with REST block modified fails', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      //Explicitly make updateDoRest fail
      this.updateDoRestSpy.and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));

      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.updateDoRest).toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), this.errorNotificationParams);
      expect(this.AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
    });

    it('should report failure if an existing aaRecord with one REST block modified fails but other gets passed', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      this.updateDoRestSpy.and.returnValues(this.$q.resolve(this.rawCeInfo), this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));

      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.updateDoRest).toHaveBeenCalled();
      //We will also see if Save button POSTs the newly created REST block.
      this.aaModel.ceInfos = [];
      this.aaModel.aaRecords = [];
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.createDoRest.calls.count()).toBe(2);
      expect(this.DoRestService.updateDoRest.calls.count()).toBe(2);
      expect(this.AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), this.errorNotificationParams);
    });

    it('should update an existing aaRecord with REST block deleted', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.controller.ui.openHours.entries = this.openHourEntries;

      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();
    });

    it('should report failure if REST block does not get deleted successfully', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.controller.ui.openHours.entries = this.openHourEntries;
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      this.DoRestService.deleteDoRest.and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), this.errorNotificationParams);
    });

    it('should report failure if one of the REST blocks does not get deleted successfully but the other does', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.controller.ui.openHours.entries = this.openHourEntries;
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      this.deleteDoRestSpy.and.returnValues(this.$q.resolve(this.rawCeInfo), this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.updateCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String), this.errorNotificationParams);
    });

    it('should not report failure if REST block does not get deleted successfully with a 404', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.controller.ui.openHours.entries = this.openHourEntries;

      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      this.deleteDoRestSpy.and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 404,
      }));
      this.controller.saveAARecords();
      this.$scope.$apply();
      expect(this.DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).not.toHaveBeenCalled();
    });

    it('should report failure if AutoAttendantCeService.createCe() failed', function () {
      this.aaModel.aaRecordUUID = '';
      this.createCeSpy.and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.AATrackChangeService.track).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.isChanged).not.toHaveBeenCalled();

      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should update an existing aaRecord successfully', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(this.aaModel.aaRecords[0]).toEqual(this.rawCeInfo);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = this.ce2CeInfo();
      expect(this.aaModel.ceInfos[0]).toEqual(ceInfo);

      // if AA Name is not changed, don't call AADependencyService.notifyAANameChange()
      expect(this.AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.track).not.toHaveBeenCalled();

      expect(this.AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord successfully in non-REST api toggled tenants too', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      spyOn(this.AACommonService, 'isRestApiToggle').and.returnValue(false);

      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(this.aaModel.aaRecords[0]).toEqual(this.rawCeInfo);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = this.ce2CeInfo();
      expect(this.aaModel.ceInfos[0]).toEqual(ceInfo);

      // if AA Name is not changed, don't call AADependencyService.notifyAANameChange()
      expect(this.AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.track).not.toHaveBeenCalled();

      expect(this.AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord with AA Name changed successfully', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      // Assume aaName is changed.
      this.aaNameChangedSpy.and.returnValue(true);
      this.controller.saveAARecords();
      this.$scope.$apply();
      expect(this.AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(this.aaModel.aaRecords[0]).toEqual(this.rawCeInfo);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = this.ce2CeInfo();
      expect(this.aaModel.ceInfos[0]).toEqual(ceInfo);

      // if AA Name is changed, call AADependencyService.notifyAANameChange()
      expect(this.AATrackChangeService.isChanged).toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).toHaveBeenCalled();
      expect(this.AATrackChangeService.track).toHaveBeenCalled();

      expect(this.AANotificationService.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should report failure if AutoAttendantCeService.updateCe() failed', function () {
      this.aaModel.aaRecords.push(this.rawCeInfo);
      this.aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      this.updateCeSpy.and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      this.controller.saveAARecords();
      this.$scope.$apply();

      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should not save when there is a name validation error', function () {
      this.nameValidationSpy.and.returnValue(false);
      this.controller.saveAARecords();
      expect(this.$scope.vm.saveUiModel).not.toHaveBeenCalled();
    });
  });

  describe('selectAA', function () {
    beforeEach(function () {
      this.readCe = spyOn(this.AutoAttendantCeService, 'readCe').and.returnValue(this.$q.resolve(_.cloneDeep(this.aCe)));
      this.readDoRestSpy = spyOn(this.DoRestService, 'readDoRest').and.returnValue(this.$q.resolve(this.doRest));
      spyOn(this.$scope.vm, 'populateUiModel');
      spyOn(this.AANotificationService, 'error');
      spyOn(this.AANotificationService, 'errorResponse');
      spyOn(this.AAModelService, 'getNewAARecord').and.callThrough();
      spyOn(this.AADependencyService, 'notifyAANameChange');
      spyOn(this.AATrackChangeService, 'isChanged');
      spyOn(this.AATrackChangeService, 'track');
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined', function () {
      this.$scope.vm.aaModel = {};
      this.controller.selectAA('');
      this.$scope.$apply();

      expect(this.AAModelService.getNewAARecord).toHaveBeenCalled();
      expect(this.$scope.vm.populateUiModel).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();

      // AAName is not tracked yet when opening new AA
      expect(this.AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.track).not.toHaveBeenCalled();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is empty', function () {
      this.$scope.vm.aaModel = {};
      this.$scope.vm.templateName = '';
      this.controller.selectAA('');
      this.$scope.$apply();
      expect(this.AAModelService.getNewAARecord).toHaveBeenCalled();
      expect(this.$scope.vm.populateUiModel).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is set', function () {
      this.$scope.vm.aaModel = {};

      this.controller.selectAA('');
      this.$scope.$apply();

      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
      expect(this.AAModelService.getNewAARecord).toHaveBeenCalled();
      expect(this.$scope.vm.populateUiModel).toHaveBeenCalled();
      expect(this.AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should be able to read an existing new aaRecord successfully when no name is given', function () {
      // when aaModel.aaRecord is defined
      this.$scope.vm.aaModel = {};
      this.$scope.vm.aaModel.aaRecord = {};
      this.controller.selectAA('');
      this.$scope.$apply();

      // $scope.vm.aaModel should not be initialized again with a new AARecord
      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();

      expect(this.$scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a name is given', function () {
      this.$scope.vm.aaModel = {};
      this.$scope.vm.aaModel.aaRecords = this.ces;
      this.controller.selectAA('AA2');
      this.$scope.$apply();

      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();

      expect(this.$scope.vm.aaModel.aaRecord.callExperienceName).toEqual(this.aCe.callExperienceName);
      expect(this.$scope.vm.populateUiModel).toHaveBeenCalled();

      // start tracking AAName when reading an existing aaRecord
      expect(this.AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.track).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully on a non-RESTAPI toggled tenant when a name is given', function () {
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      spyOn(this.AACommonService, 'isRestApiToggle').and.returnValue(false);
      this.controller.selectAA('AA2');
      this.$scope.$apply();

      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();

      expect(_.get(this.controller.aaModel.aaRecord, 'callExperienceName')).toBe(this.aCe.callExperienceName);
      expect(this.controller.populateUiModel).toHaveBeenCalled();

      // start tracking AAName when reading an existing aaRecord
      expect(_.get(this.controller.aaModel, 'aaRecords').length).toBe(3);
      expect(this.AATrackChangeService.isChanged).not.toHaveBeenCalled();
      expect(this.AADependencyService.notifyAANameChange).not.toHaveBeenCalled();
      expect(this.AATrackChangeService.track).toHaveBeenCalled();
    });

    it('should return error when the backend return 500 error', function () {
      this.readCe.and.returnValue(this.$q.reject({ status: 500 }));
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      this.controller.selectAA('AA2');
      this.$scope.$apply();

      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.controller.populateUiModel).not.toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a REST block is already there', function () {
      this.readCe.and.returnValue(this.$q.resolve(this.aCe));
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      expect(_.get(this.controller.aaModel, 'aaRecords').length).toBe(3);
      this.controller.selectAA('AAA3');
      this.$scope.$apply();

      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();
      expect(this.DoRestService.readDoRest).toHaveBeenCalled();
      expect(this.controller.populateUiModel).toHaveBeenCalled();
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions').length).toBe(4);
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe(this.restId);
    });

    it('should return an error when an existing REST block read gets errored', function () {
      this.readCe.and.returnValue(this.$q.resolve(this.aCe));
      this.readDoRestSpy.and.returnValue(this.$q.reject({ status: 500 }));
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      this.controller.selectAA('AAA3');
      this.$scope.$apply();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.controller.populateUiModel).toHaveBeenCalled();
    });

    it('should return an error when one REST block gets successfully read but other REST block read gets errored', function () {
      this.readCe.and.returnValue(this.$q.resolve(this.aCe));
      this.readDoRestSpy.and.returnValues(this.$q.resolve(this.doRest),
        this.$q.reject({
          status: 500,
        })
      );
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      this.controller.selectAA('AAA3');
      this.$scope.$apply();
      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
      expect(this.controller.populateUiModel).toHaveBeenCalled();
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions').length).toBe(4);
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe(this.restId);
    });

    it('should return an error when one REST block gets successfully read but other REST block read doesnot get username in authentication block', function () {
      this.readCe.and.returnValue(this.$q.resolve(this.aCe));
      this.readDoRestSpy.and.returnValue(this.$q.resolve(this.doRestWithoutCredentials));
      this.controller.aaModel = {};
      this.controller.aaModel.aaRecords = this.ces;
      this.controller.selectAA('AAA3');
      this.$scope.$apply();
      expect(this.AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(this.AANotificationService.error).toHaveBeenCalled();
      expect(this.controller.populateUiModel).toHaveBeenCalled();
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions').length).toBe(4);
      expect(_.get(this.controller.aaModel.aaRecord.actionSets[0], 'actions[1].doREST.id')).toBe(this.restId);
    });
  });

  describe('setupTemplate', function () {
    beforeEach(function () {
      spyOn(this.AANotificationService, 'success');
      spyOn(this.AANotificationService, 'error');
    });

    it('should set up a say PhoneMenu open hours template using real template1', function () {
      this.$scope.vm.templateName = 'Basic';
      this.controller.setupTemplate();

      expect(this.$scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect(this.$scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('play');
      expect(this.$scope.vm.ui.openHours['entries'][1]['type']).toEqual('MENU_OPTION');

      expect(this.$scope.vm.ui.openHours['entries'][1]['entries'].length).toEqual(1);
      expect(this.$scope.vm.ui.openHours['entries'][1]['entries'][0]['type']).toEqual('MENU_OPTION');
      expect(this.$scope.vm.ui.openHours['entries'][1]['entries'][0]['key']).toEqual('0');
      expect(this.$scope.vm.ui.openHours['entries'][1]['entries'][0]['actions'].length).toEqual(1);

      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
    });

    it('should set up a say say say open hours template using test template', function () {
      this.$scope.vm.templateDefinitions = [{
        tname: 'template2',
        actions: [{
          lane: 'openHours',
          actionset: ['play3', 'play4', 'play5'],
        }],
      }];
      this.$scope.vm.templateName = 'template2';
      this.controller.setupTemplate();
      expect(this.$scope.vm.ui.openHours['entries'].length).toEqual(3);
      expect(this.$scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('play3');
      expect(this.$scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('play4');
      expect(this.$scope.vm.ui.openHours['entries'][2]['actions'][0]['name']).toEqual('play5');
      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
    });

    it('should set up a say say open hours - say closed hours template', function () {
      this.$scope.vm.templateDefinitions = [{
        tname: 'template3',
        actions: [{
          lane: 'openHours',
          actionset: ['playOpen1', 'playOpen2'],
        }, {
          lane: 'closedHours',
          actionset: ['playClosed1'],
        }],
      }];
      this.$scope.vm.templateName = 'template3';
      this.controller.setupTemplate();

      expect(this.$scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect(this.$scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('playOpen1');
      expect(this.$scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('playOpen2');
      expect(this.$scope.vm.ui.closedHours['entries'].length).toEqual(1);
      expect(this.$scope.vm.ui.closedHours['entries'][0]['actions'][0]['name']).toEqual('playClosed1');
      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
      expect(this.$scope.vm.ui.isClosedHours).toBeTruthy();
      expect(this.$scope.vm.ui.isHolidays).toBeFalsy();
    });

    it('should fail to create template since template name is not valid', function () {
      this.$scope.vm.templateName = 'templateDoesNotExist';
      this.controller.setupTemplate();

      expect(this.AANotificationService.error).toHaveBeenCalledWith('autoAttendant.errorInvalidTemplate', jasmine.any(Object));
    });

    it('should fail to create template since template has no actions', function () {
      this.$scope.vm.templateDefinitions = [{
        tname: 'templateNoActions',
      }];

      this.$scope.vm.templateName = 'templateNoActions';
      this.controller.setupTemplate();

      expect(this.AANotificationService.error).toHaveBeenCalledWith('autoAttendant.errorInvalidTemplateDef', jasmine.any(Object));
    });

    it('should fail to create template since template has no action set in closedHours lane', function () {
      this.$scope.vm.templateDefinitions = [{
        tname: 'templateMissingActionSet',
        actions: [{
          lane: 'openHours',
          actionset: ['playOpen1', 'playOpen2'],
        }, {
          lane: 'closedHours',
        }],
      }];

      this.$scope.vm.templateName = 'templateMissingActionSet';
      this.controller.setupTemplate();

      expect(this.AANotificationService.error).toHaveBeenCalledWith('autoAttendant.errorInvalidTemplateDef', jasmine.any(Object));
    });

    it('should NOT display add step icons on aa-builder-lane', function () {
      this.$rootScope.schedule = 'openHours';
      this.$rootScope.index = 0;
      this.view = this.$compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")(this.$rootScope);

      this.$rootScope.$digest();
      expect(this.view.find('aa-panel').hasClass('ng-show')).toBeFalsy();
      expect(this.view.find('aa-new-step-info').hasClass('ng-show')).toBeFalsy();
    });

    it('should NOT display add step icons on aa-builder-actions', function () {
      this.$rootScope.schedule = 'openHours';
      this.$rootScope.index = 0;
      this.view = this.$compile('<aa-builder-actions></aa-builder-actions>')(this.$rootScope);

      this.$rootScope.$digest();
      expect(this.view.find('aa-panel').hasClass('ng-show')).toBeFalsy();
      expect(this.view.find('aa-panel-body').hasClass('ng-show')).toBeFalsy();
      expect(this.view.find('aa-action-delete').hasClass('ng-show')).toBeFalsy();
    });

    // TODO:SIMPLETEMPLATE Should also verify that delete steps are not shown
  });

  describe('populateUiModel', function () {
    it('should initialize new openHours, closedHours and holidays menus successfully if they do not exist', function () {
      this.$scope.vm.aaModel = {};
      this.$scope.vm.aaModel.aaRecord = this.aCe;
      this.$scope.vm.ui = {};
      this.controller.populateUiModel();

      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
      expect(this.$scope.vm.ui.isClosedHours).toBeTruthy();
      expect(this.$scope.vm.ui.isHolidays).toBeTruthy();
    });

    it('should build openHours, closedHours and holidays menus successfully from model', function () {
      this.$scope.vm.aaModel = {};
      this.$scope.vm.aaModel.aaRecord = this.a3LaneCe;
      this.$scope.vm.ui = {};
      this.controller.populateUiModel();

      expect(this.$scope.vm.ui.isOpenHours).toBeTruthy();
      expect(this.$scope.vm.ui.isClosedHours).toBeTruthy();
      expect(this.$scope.vm.ui.isHolidays).toBeTruthy();
    });
  });

  describe('saveUiModel', function () {
    beforeEach(function () {
      spyOn(this.AutoAttendantCeInfoModelService, 'setCeInfo');
      spyOn(this.AutoAttendantCeMenuModelService, 'updateCombinedMenu');
      spyOn(this.AutoAttendantCeMenuModelService, 'deleteCombinedMenu');
      spyOn(this.AutoAttendantCeMenuModelService, 'newCeMenu').and.callThrough();
      this.$scope.vm.aaModel = {};
      this.$scope.vm.aaModel.aaRecord = {};
      this.$scope.vm.ui = {};
      this.$scope.vm.ui.ceInfo = this.ce2CeInfo();
      this.$scope.vm.ui.builder = {};
      this.$scope.vm.ui.builder.ceInfo_name = 'AAA2';
    });

    it('should write UI CeInfo into model', function () {
      this.controller.saveUiModel();
      expect(this.AutoAttendantCeInfoModelService.setCeInfo).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, this.$scope.vm.ui.ceInfo);
    });

    it('should write openHours menu into model', function () {
      this.$scope.vm.ui.isOpenHours = true;
      this.$scope.vm.ui.isClosedHours = false;
      this.$scope.vm.ui.isHolidayss = false;
      this.$scope.vm.ui.openHours = {};
      this.controller.saveUiModel();

      expect(this.AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'openHours', this.$scope.vm.ui.openHours);
      expect(this.AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'closedHours');
      expect(this.AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write closedHours menu into model', function () {
      this.$scope.vm.ui.isOpenHours = false;
      this.$scope.vm.ui.isClosedHours = true;
      this.$scope.vm.ui.isHolidays = false;
      this.$scope.vm.ui.closedHours = {};
      this.controller.saveUiModel();

      expect(this.AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'closedHours', this.$scope.vm.ui.closedHours);
      expect(this.AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write holidays menu into model', function () {
      this.$scope.vm.ui.isOpenHours = false;
      this.$scope.vm.ui.isClosedHours = false;
      this.$scope.vm.ui.isHolidays = true;
      this.$scope.vm.ui.holidays = {};
      this.$scope.vm.ui.holidaysValue = 'closedHours';
      this.controller.saveUiModel();

      expect(this.AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'holidays', this.$scope.vm.ui.holidays, this.$scope.vm.ui.holidaysValue);
      expect(this.AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith(this.$scope.vm.aaModel.aaRecord, 'closedHours');
    });
  });

  describe('setAANameFocus', function () {
    it('should set model aaNameFocus variable to true', function () {
      this.$scope.vm.aaNameFocus = 'false';
      this.controller.setAANameFocus();

      expect(this.$scope.vm.aaNameFocus).toBeTruthy();
    });
  });

  describe('removeNewStep', function () {
    it('should remove all New Step placeholders from a menu', function () {
      var menuWithNewStep = this.combinedMenus['menuWithNewStep'];

      expect(menuWithNewStep.entries.length).toEqual(4);
      this.controller.removeNewStep(menuWithNewStep);
      expect(menuWithNewStep.entries.length).toEqual(2);
    });
  });

  describe('save8To5Schedule', function () {
    beforeEach(function () {
      this.$scope.vm.ui = {};
      this.$scope.vm.ui.ceInfo = {};
      this.$scope.vm.ui.builder = {};
      this.$scope.vm.ui.builder.ceInfo_name = 'AA';

      this.createScheduleDefer = this.$q.defer();
      this.saveAARecordDefer = this.$q.defer();
      spyOn(this.AAUiScheduleService, 'create8To5Schedule').and.returnValue(this.createScheduleDefer.promise);
      spyOn(this.controller, 'saveAARecords').and.returnValue(this.saveAARecordDefer.promise);
      spyOn(this.AANotificationService, 'errorResponse');
    });

    it('should return and resolve a promise when successfully save a 8to5 schedule', function () {
      var saveSchedulePromise = this.controller.save8To5Schedule('AA');

      var promiseResolved = false;
      saveSchedulePromise.then(function () {
        promiseResolved = true;
      });
      this.createScheduleDefer.resolve('12345');

      expect(promiseResolved).toBeFalsy();
      expect(this.$scope.vm.ui.ceInfo.scheduleId).toBeUndefined();

      this.$rootScope.$apply();

      expect(promiseResolved).toBeTruthy();
      expect(this.$scope.vm.ui.ceInfo.scheduleId).toBe('12345');
    });

    it('should return and reject a promise when failed to save a 8to5 schedule', function () {
      var saveSchedulePromise = this.controller.save8To5Schedule('AA');

      var errorText = '';
      saveSchedulePromise.catch(function (error) {
        errorText = error;
      });
      this.createScheduleDefer.reject({
        name: 'AA',
        statusText: 'Server Error',
        status: '500',
      });

      expect(errorText).toBe('');

      this.$rootScope.$apply();

      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
      expect(errorText).toBe('SAVE_SCHEDULE_FAILURE');
    });
  });

  describe('saveCeDefinition', function () {
    beforeEach(function () {
      this.$scope.vm.ui = {};
      this.$scope.vm.ui.ceInfo = {};
      this.$scope.vm.ui.builder = {};
      this.$scope.vm.isAANameDefined = false;

      this.saveAARecordDefer = this.$q.defer();
      spyOn(this.controller, 'saveAARecords').and.returnValue(this.saveAARecordDefer.promise);
    });

    it('should return and resolve a promise when successfully save a CE Definition', function () {
      var saveCeDefinitionPromise = this.controller.saveCeDefinition();

      var promiseResolved = false;
      saveCeDefinitionPromise.then(function () {
        promiseResolved = true;
      });
      this.saveAARecordDefer.resolve();

      expect(promiseResolved).toBeFalsy();
      expect(this.$scope.vm.isAANameDefined).toBeFalsy();

      this.$rootScope.$apply();

      expect(promiseResolved).toBeTruthy();
      expect(this.$scope.vm.isAANameDefined).toBeTruthy();
    });

    it('should return and reject a promise when failed to save a CE Definition', function () {
      var saveCeDefinitionPromise = this.controller.saveCeDefinition();

      var errorText = '';
      saveCeDefinitionPromise.catch(function (error) {
        errorText = error;
      });
      this.saveAARecordDefer.reject();

      expect(errorText).toBe('');
      this.$rootScope.$apply();
      expect(errorText).toBe('CE_SAVE_FAILURE');
    });
  });

  describe('delete9To5Schedule', function () {
    beforeEach(function () {
      this.$scope.vm.ui = {};
      this.$scope.vm.ui.ceInfo = {};
      this.$scope.vm.ui.builder = {};
      this.$scope.vm.isAANameDefined = false;

      this.deleteCalendarDefer = this.$q.defer();
      spyOn(this.AACalendarService, 'deleteCalendar').and.returnValue(this.deleteCalendarDefer.promise);
      spyOn(this.AANotificationService, 'error');
      spyOn(this.AANotificationService, 'errorResponse');
    });

    it('should delete the predefined 9 to 5 schedule when there is a CE_SAVE_FAILURE', function () {
      this.controller.delete8To5Schedule('CE_SAVE_FAILURE');
      this.deleteCalendarDefer.resolve();

      this.$rootScope.$apply();

      expect(this.AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(this.AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should display an error info when failed to delete a calendar', function () {
      this.controller.delete8To5Schedule('CE_SAVE_FAILURE');
      this.deleteCalendarDefer.reject();

      this.$rootScope.$apply();

      expect(this.AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(this.AANotificationService.errorResponse).toHaveBeenCalled();
    });

    it('should do nothing when there is a SAVE_SCHEDULE_FAILURE', function () {
      this.controller.delete8To5Schedule('SAVE_SCHEDULE_FAILURE');
      this.$rootScope.$apply();
      expect(this.AACalendarService.deleteCalendar).not.toHaveBeenCalled();
    });
  });

  describe('Received AANameCreated Event', function () {
    beforeEach(function () {
      this.$scope.vm.ui = {};
      this.$scope.vm.ui.ceInfo = {};
      this.$scope.vm.ui.builder = {};
      this.$scope.vm.ui.aaTemplate = 'BusinessHours';
      this.$scope.vm.ui.builder.ceInfo_name = 'AA';
      this.$scope.vm.isAANameDefined = false;

      this.saveAARecordDefer = this.$q.defer();
      this.save8To5ScheduleDefer = this.$q.defer();
      this.saveCeDefinitionDefer = this.$q.defer();

      spyOn(this.controller, 'saveAARecords').and.returnValue(this.saveAARecordDefer.promise);

      spyOn(this.controller, 'save8To5Schedule').and.returnValue(this.save8To5ScheduleDefer.promise);
      spyOn(this.controller, 'saveCeDefinition').and.returnValue(this.saveCeDefinitionDefer.promise);
      spyOn(this.controller, 'delete8To5Schedule');
    });

    it('should save a 8to5 schedule and save current CE definition for BusinessHours creation.', function () {
      this.$rootScope.$broadcast('AANameCreated');
      this.save8To5ScheduleDefer.resolve();
      this.saveCeDefinitionDefer.resolve();

      this.$rootScope.$apply();

      expect(this.controller.save8To5Schedule).toHaveBeenCalled();
      expect(this.controller.saveCeDefinition).toHaveBeenCalled();
      expect(this.controller.delete8To5Schedule).not.toHaveBeenCalled();
    });

    it('should invoke saveAARecords for Basic template creation', function () {
      this.$scope.vm.ui.aaTemplate = 'Basic';
      this.$rootScope.$broadcast('AANameCreated');
      this.saveAARecordDefer.resolve();

      this.$rootScope.$apply();

      expect(this.controller.saveAARecords).toHaveBeenCalled();
      expect(this.$scope.vm.isAANameDefined).toBeTruthy();
    });

    it('should invoke saveAARecords for Custom template creation', function () {
      this.$scope.vm.ui.aaTemplate = '';
      this.$rootScope.$broadcast('AANameCreated');
      this.saveAARecordDefer.resolve();

      this.$rootScope.$apply();

      expect(this.controller.saveAARecords).toHaveBeenCalled();
      expect(this.$scope.vm.isAANameDefined).toBeTruthy();
    });

    it('should undo the 8to5 schedule save if save current CE definition failed.', function () {
      this.$rootScope.$broadcast('AANameCreated');
      this.save8To5ScheduleDefer.resolve();
      this.saveCeDefinitionDefer.reject();

      this.$rootScope.$apply();

      expect(this.controller.save8To5Schedule).toHaveBeenCalled();
      expect(this.controller.saveCeDefinition).toHaveBeenCalled();
      expect(this.controller.delete8To5Schedule).toHaveBeenCalled();
    });

    it('should invoke delete8To5Schedule but do nothing if fail to save the 9 to 5 schedule.', function () {
      this.$rootScope.$broadcast('AANameCreated');
      this.save8To5ScheduleDefer.reject();

      this.$rootScope.$apply();

      expect(this.controller.save8To5Schedule).toHaveBeenCalled();
      expect(this.controller.saveCeDefinition).not.toHaveBeenCalled();
      expect(this.controller.delete8To5Schedule).toHaveBeenCalled();
    });
  });
});
