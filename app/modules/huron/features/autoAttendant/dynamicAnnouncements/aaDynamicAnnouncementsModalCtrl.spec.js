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
          aaElementType: 'SayMessage',
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.variableOptions.length).toBe(5);
        expect(controller.readAsOptions.length).toBe(4);
      });
    });

    describe('with session variables', function () {
      beforeEach(function () {
        var var_names = _.clone(customVarJson[0].var_name);
        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(var_names));
        spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
        spyOn(AACommonService, 'sortByProperty').and.callThrough();
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
          aaElementType: 'SayMessage',
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.variableOptions.length).toBe(10);
        expect(controller.readAsOptions.length).toBe(4);
      });
    });
    describe('with session variables plus added ui variables', function () {
      beforeEach(function () {
        var var_names = _.clone(customVarJson[0].var_name);

        // tests for duplicate variables from query
        var_names.push('account_no');

        spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(var_names));
        spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
        // test for duplicate variables at same time
        spyOn(AACommonService, 'collectThisCeActionValue').and.returnValue(['aaaaaa', 'zzzzzzz', 'aaaaaa', 'zzzzzzz']);
        controller = $controller('AADynamicAnnouncementsModalCtrl', {
          $scope: $scope,
          $modalInstance: modalFake,
          variableSelection: selection,
          readAsSelection: selection,
          aaElementType: 'SayMessage',
        });
        $scope.$apply();
      });

      it('should validate ui vars got added', function () {
        expect(controller).toBeDefined();
        // no dups
        expect(controller.variableOptions.length).toBe(12);
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
          aaElementType: 'SayMessage',
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
          aaElementType: 'SayMessage',
        });
        $scope.$apply();
      });

      it('should be empty when variable not selected', function () {
        expect(controller.isSaveEnabled()).toBe('');
      });

      it('should be empty when variable is not selected but readAs option is selected', function () {
        controller.readAsSelection.label = 'Number';
        controller.variableSelection.label = '';
        expect(controller.isSaveEnabled()).toBe('');
      });

      it('should not return empty when variable is selected', function () {
        controller.variableSelection.label = 'testVariable';
        expect(controller.isSaveEnabled()).toBe('testVariable');
      });

      it('should not return empty when variable and readAs option is selected', function () {
        controller.variableSelection.label = 'testVariable';
        controller.readAsSelection.label = 'Number';
        expect(controller.isSaveEnabled()).toBe('testVariable');
      });
    });
  });
});
