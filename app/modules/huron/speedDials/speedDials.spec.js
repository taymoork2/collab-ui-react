'use strict';

describe('Controller: SpeedDialsCtrl', function () {
  var controller, $scope, $modal, $q, $stateParams, HuronConfig, $httpBackend;

  var defaultList;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  $stateParams = {
    currentUser: currentUser
  };

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$q_, _$httpBackend_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;

    defaultList = [{
      index: 1,
      label: "Gary Gaetti",
      number: "2361",
      url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/1'
    }, {
      index: 2,
      label: "Kirby Puckett",
      number: "+19195551214",
      url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/2'
    }, {
      index: 3,
      label: "Sammy Sosa",
      number: "+19185551212",
      url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/3'
    }, {
      index: 4,
      label: "Kent Herbeck",
      number: "kherbeck@cisco.com",
      url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/4'
    }];

    $httpBackend.whenGET(HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials').respond(200);
    $httpBackend.whenPUT(HuronConfig.getCmiV2Url() + '/customers/users/111/bulk/speeddials').respond(200);

    controller = $controller('SpeedDialsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams
    });

    $scope.$apply();
    controller.speedDialList = angular.copy(defaultList);
  }));

  describe('add', function () {
    it('should add an empty element', function () {
      spyOn(controller, 'setEdit');
      var length = controller.speedDialList.length;
      controller.add();
      expect(controller.speedDialList.length).toEqual(length + 1);
      expect(controller.speedDialList[length].index).toEqual(length + 1);
      expect(controller.speedDialList[length].label).toEqual('');
      expect(controller.speedDialList[length].number).toEqual('');
      expect(controller.setEdit).toHaveBeenCalled();
    });
  });

  describe('setEdit', function () {
    it('should set edit with a correct speed dial', function () {
      expect(controller.editing).toBeFalsy();
      var sd = controller.speedDialList[0];
      controller.setEdit(sd);
      expect(controller.editing).toBeTruthy();
      expect(sd.edit).toBeTruthy();
      expect(controller.newLabel).toEqual(sd.label);
      expect(controller.newNumber).toEqual(sd.number);
    });

    it('should not set edit with no parameter', function () {
      expect(controller.editing).toBeFalsy();
      controller.setEdit();
      expect(controller.editing).toBeFalsy();
    });

    it('should not set edit with empty object', function () {
      expect(controller.editing).toBeFalsy();
      controller.setEdit({});
      expect(controller.editing).toBeFalsy();
    });
  });

  describe('setReorder', function () {
    it('should set reorder', function () {
      expect(controller.reordering).toBeFalsy();
      controller.setReorder();
      expect(controller.reordering).toBeTruthy();
      expect(controller.copyList).toEqual(controller.speedDialList);
    });
  });

  describe('delete', function () {
    it('should delete the first one', function () {
      var expected = [{
        index: 1,
        label: "Kirby Puckett",
        number: "+19195551214",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/2'
      }, {
        index: 2,
        label: "Sammy Sosa",
        number: "+19185551212",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/3'
      }, {
        index: 3,
        label: "Kent Herbeck",
        number: "kherbeck@cisco.com",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/4'
      }];
      var length = controller.speedDialList.length;
      var modalDefer = $q.defer();
      spyOn($modal, 'open').and.returnValue({
        result: modalDefer.promise
      });
      controller.delete(controller.speedDialList[0]);
      modalDefer.resolve();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
      expect(controller.speedDialList.length).toEqual(length - 1);
      expect(controller.speedDialList).toEqual(expected);
    });
  });

  describe('reset', function () {
    it('after an add should delete the new speed dials', function () {
      var length = controller.speedDialList.length;
      controller.add();
      expect(controller.speedDialList.length).toEqual(length + 1);
      controller.reset();
      expect(controller.speedDialList.length).toEqual(length);
      expect(controller.speedDialList).toEqual(defaultList);
    });

    it('after an update should put the edit field to false', function () {
      var sd = controller.speedDialList[0];
      expect(sd.edit).toBeUndefined();
      controller.setEdit(sd);
      expect(controller.editing).toBeTruthy();
      expect(sd.edit).toBeTruthy();
      controller.reset();
      expect(controller.editing).toBeFalsy();
      expect(sd.edit).toBeFalsy();
      var expected = angular.copy(defaultList);
      expected[0].edit = false;
      expect(controller.speedDialList).toEqual(expected);
    });

    it('after a reorder should put back the copy order', function () {
      controller.setReorder();
      expect(controller.reordering).toBeTruthy();
      var sd = controller.speedDialList[1];
      controller.speedDialList[1] = controller.speedDialList[2];
      controller.speedDialList[2] = sd;
      expect(controller.speedDialList).not.toEqual(defaultList);
      controller.reset();
      expect(controller.reordering).toBeFalsy();
      expect(controller.speedDialList).toEqual(defaultList);
    });
  });

  describe('save', function () {
    it('after an add should add the new speed dials', function () {
      var length = controller.speedDialList.length;
      controller.add();
      controller.newLabel = 'Test';
      controller.newNumber = '0000';
      expect(controller.speedDialList.length).toEqual(length + 1);
      controller.save();
      expect(controller.speedDialList.length).toEqual(length + 1);
      var expected = angular.copy(defaultList);
      expected.push({
        index: 5,
        label: 'Test',
        number: '0000',
        edit: false
      });
      expect(controller.speedDialList).toEqual(expected);
    });

    it('after an update should edit the list', function () {
      var sd = controller.speedDialList[0];
      expect(sd.edit).toBeUndefined();
      controller.setEdit(sd);
      expect(controller.editing).toBeTruthy();
      expect(sd.edit).toBeTruthy();
      controller.newLabel = 'Test';
      controller.newNumber = '0000';
      controller.save();
      expect(sd.edit).toBeFalsy();
      expect(sd.label).toEqual('Test');
      expect(sd.number).toEqual('0000');
    });

    it('after a reorder should change the list order and index', function () {
      controller.setReorder();
      expect(controller.reordering).toBeTruthy();
      var sd = controller.speedDialList[1];
      controller.speedDialList[1] = controller.speedDialList[2];
      controller.speedDialList[2] = sd;
      expect(controller.speedDialList).not.toEqual(defaultList);
      controller.save();
      var expected = [{
        index: 1,
        label: "Gary Gaetti",
        number: "2361",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/1'
      }, {
        index: 2,
        label: "Sammy Sosa",
        number: "+19185551212",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/3'
      }, {
        index: 3,
        label: "Kirby Puckett",
        number: "+19195551214",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/2'
      }, {
        index: 4,
        label: "Kent Herbeck",
        number: "kherbeck@cisco.com",
        url: HuronConfig.getCmiV2Url() + '/customers/users/111/speeddials/4'
      }];
      expect(controller.speedDialList).toEqual(expected);
    });
  });
});
