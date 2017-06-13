'use strict';

describe('Controller: AADynamicAnnouncementsModalCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $q, q;
  var AACommonService;
  var AAModelService;
  var AASessionVariableService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');
  var aaModel = {
    aaRecord: {
      scheduleId: '1',
      callExperienceName: 'AA1',
    },
    aaRecords: [{
      callExperienceURL: 'url-1/1111',
      callExperienceName: 'AA1',
    }, {
      callExperienceURL: 'url-2/1112',
      callExperienceName: 'AA2',
    }],
    aaRecordUUID: '1111',
    ceInfos: [],
  };
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
  };

  var selection = {
    label: '',
    value: '',
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _AACommonService_, _AAModelService_, _AASessionVariableService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    AACommonService = _AACommonService_;
    AAModelService = _AAModelService_;
    AASessionVariableService = _AASessionVariableService_;

    q = $q;
  }));

  describe('activate', function () {
    describe('basic', function () {
      beforeEach(function () {
        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.reject());
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.variableOptions.length).toEqual(5);
        expect(controller.readAsOptions.length).toEqual(4);
      });
    });

    describe('with session variables', function () {
      beforeEach(function () {
        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(customVarJson));
        spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
        spyOn(AACommonService, 'sortByProperty').and.callThrough();
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.variableOptions.length).toEqual(6);
        expect(controller.readAsOptions.length).toEqual(4);
      });
    });

    describe('modal close', function () {
      beforeEach(function () {
        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.reject());
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
        });
        $scope.$apply();
      });

      it('should close modal', function () {
        controller.ok();
        expect(modalFake.close).toHaveBeenCalled();
      });
    });

    describe('isSaveEnabled', function () {
      beforeEach(function () {
        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.reject());
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
        });
        $scope.$apply();
      });

      it('should be false', function () {
        expect(controller.isSaveEnabled()).toEqual(false);
      });

      it('should be false', function () {
        controller.readAsSelection.label = true;
        expect(controller.isSaveEnabled()).toEqual(false);
      });

      it('should be false', function () {
        controller.variableSelection.label = true;
        expect(controller.isSaveEnabled()).toEqual(true);
      });

      it('should be true', function () {
        controller.variableSelection.label = true;
        controller.readAsSelection.label = true;
        expect(controller.isSaveEnabled()).toEqual(true);
      });
    });
  });
});
