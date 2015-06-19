'use strict';

describe('Controller: AutoAttendantLandingCtrl', function () {
  var controller, AutoAttendantLandingCtrl, Authinfo, Notification, DirectoryNumberService, AutoAttendantCeService;
  var AAModelService, AutoAttendantCeMenuModelService, AutoAttendantCeInfoModelService;
  var $rootScope, $scope, $q, $translate;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');

  var dnI = 0;
  var dns = [{
    pattern: '1111'
  }, {
    pattern: '1112'
  }];

  var aaModel = {};

  var listCesSpy;
  var deleteCeSpy;

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$q_, $controller, _$translate_, _Authinfo_, _Notification_,
    _DirectoryNumberService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_, _AutoAttendantCeService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;
    $translate = _$translate_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    DirectoryNumberService = _DirectoryNumberService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;

    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(AutoAttendantCeMenuModelService, 'newAAModel').and.returnValue(aaModel);

    dnI = 0;
    spyOn(DirectoryNumberService, 'get').and.callFake(function () {
      var dn = dns[dnI];
      dnI++;
      return {
        $promise: $q.when(dn)
      };
    });
    listCesSpy = spyOn(AutoAttendantCeService, 'listCes').and.returnValue($q.when(angular.copy(ces)));

    deleteCeSpy = spyOn(AutoAttendantCeService, 'deleteCe').and.returnValue($q.when({}));
    spyOn(AutoAttendantCeInfoModelService, 'deleteCeInfo');

    controller = $controller('AutoAttendantLandingCtrl', {});
    $scope.$apply();
  }));

  beforeEach(function () {
    var ceInfos = [];
    for (var i = 0; i < cesWithNumber.length; i++) {
      var _ceInfo = ce2CeInfo(cesWithNumber[i]);
      ceInfos[i] = _ceInfo;
    }
    aaModel.ceInfos = ceInfos;
    aaModel.aaRecords = ces;
    aaModel.aaRecord = undefined;
    dnI = 0;
  });

  afterEach(function () {

  });

  describe('listAutoAttendants', function () {

    it('should list ces', function () {
      controller.listAutoAttendants();
      $scope.$apply();

      expect(angular.equals(aaModel.aaRecords, cesWithNumber)).toEqual(true);
    });

    it('should detect 500 Internal server error', function () {
      listCesSpy.and.returnValue(
        $q.reject({
          status: 500
        })
      );
      spyOn(Notification, 'notify');
      controller.listAutoAttendants();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('deleteAA', function () {

    it('should delete selected ce and notify success', function () {
      var _ceInfo = ce2CeInfo(ces[0]);
      controller.deleteAA(_ceInfo);
      spyOn(Notification, 'notify');
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should detect 500 Internal server error and notify error', function () {
      deleteCeSpy.and.returnValue(
        $q.reject({
          status: 500
        })
      );
      spyOn(Notification, 'notify');
      var _ceInfo = ce2CeInfo(ces[0]);
      controller.deleteAA(_ceInfo);
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('selectAA', function () {

    it('should copy selected aaRecord into aaModel.aaRecord', function () {
      var _ceInfo = ce2CeInfo(ces[0]);
      controller.selectAA(_ceInfo.getName());
      expect(angular.equals(aaModel.aaRecord, aaModel.aaRecords[0])).toEqual(true);
    });

    it('should create new aaRecord when aaName is blank', function () {
      controller.selectAA('');
      expect(angular.equals(aaModel.aaRecord, AutoAttendantCeMenuModelService.newAARecord())).toEqual(true);
    });
  });

});
