'use strict';

describe('Controller: AAVarNamesModalCtrl', function () {
  var controller;
  var AAModelService;
  var $scope;

  var aaModel = {
    aaRecord: { callExperienceName: 'thisCe' },

    aaRecords: [
      { callExperienceURL: 'URL Thomas/1111', callExperienceName: 'Earl Thomas' },
      { callExperienceURL: 'URL of Sandwich/2222', callExperienceName: 'Earl of Sandwich' },
      { callExperienceURL: 'URL Scruggs/3333', callExperienceName: 'Earl Scruggs' },
      { callExperienceURL: 'URL Hines/4444', callExperienceName: 'Earl Hines' },
    ],
  };

  var theseVarNames = {
    ce_id: [
      '1111',
      '3333',
      '4444',
    ],
  };

  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _AAModelService_) {
    $scope = _$rootScope_;

    AAModelService = _AAModelService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    $scope.schedule = 'openHours';
    controller = $controller;
  }));

  afterEach(function () {
    $scope = null;
    AAModelService = null;
    controller = null;
  });


  describe('Variable names modal', function () {
    it('should expect to be activated', function () {
      var cntl = controller('AAVarNamesModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        varNames: theseVarNames,
        ceHasVar: false,
      });
      $scope.$apply();
      expect(cntl.dependentNames.length).toEqual(3);
      expect(cntl.dependentNames[0]).toEqual('Earl Thomas');
      expect(cntl.dependentNames[1]).toEqual('Earl Scruggs');
      expect(cntl.dependentNames[2]).toEqual('Earl Hines');
    });

    it('should expect to be activated with local variable names and array', function () {
      var cntl = controller('AAVarNamesModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        varNames: theseVarNames,
        ceHasVar: true,
      });

      $scope.$apply();

      expect(cntl.dependentNames.length).toEqual(4);

      expect(cntl.dependentNames[0]).toEqual('thisCe');
      expect(cntl.dependentNames[1]).toEqual('Earl Thomas');
      expect(cntl.dependentNames[2]).toEqual('Earl Scruggs');
      expect(cntl.dependentNames[3]).toEqual('Earl Hines');
    });
    it('should expect to be activated with local variable and no array', function () {
      var cntl = controller('AAVarNamesModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        varNames: [],
        ceHasVar: true,
      });

      $scope.$apply();

      expect(cntl.dependentNames.length).toEqual(1);

      expect(cntl.dependentNames[0]).toEqual('thisCe');
    });
  });
});
