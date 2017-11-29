'use strict';

describe('Controller: AARestApiCtrl', function () {
  var $controller, $modal;
  var AAUiModelService, AutoAttendantCeMenuModelService, AACommonService;
  var $rootScope, $scope, modal, $q;
  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$modal_, _$rootScope_, _$q_, _AutoAttendantCeMenuModelService_, _AACommonService_, _AAUiModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $modal = _$modal_;
    $q = _$q_;

    $controller = _$controller_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AACommonService = _AACommonService_;

    modal = $q.defer();
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = 'menu1';

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AACommonService, 'setIsValid').and.callThrough();
    spyOn(AACommonService, 'setRestApiStatus').and.callThrough();
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
  }));

  afterEach((function () {
    $rootScope = null;
    $scope = null;
    $modal = null;
    $q = null;
    $controller = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    AACommonService = null;
  }));

  describe('openConfigureApiModal', function () {
    var controller;
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
      controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
    });

    it('should open the Modal on Validation success', function () {
      controller.openConfigureApiModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve();
      $scope.$apply();
    });
  });

  describe('openConfigureApiModal', function () {
    it('should populate the dynamicValues', function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
      actionEntry.url = [{
        action: {
          eval: {
            value: 'Original-Caller-Number',
          },
        },
        isDynamic: true,
        htmlModel: '%3Caa-insertion-element%20element-text%3D%22Original-Caller-Number%22%20read-as%3D%22%22%20element-id%3D%22configureApiUrl%22%20aa-Element-Type%3D%22REST%22%3E%3C%2Faa-insertion-element%3E',
      }];
      actionEntry.method = 'GET';
      actionEntry.username = 'testUsername';
      aaUiModel[schedule].entries[0].addAction(actionEntry);
      var controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      controller.openConfigureApiModal();
      modal.resolve();
      $scope.$apply();
      expect(_.get(controller, 'dynamicValues[0].model', '')).toBe('Original-Caller-Number');
      expect(_.get(controller, 'dynamicValues[0].htmlModel', '')).not.toBeNull();
      expect(_.get(controller, 'menuEntry.actions[0].username')).toBe('testUsername');
      expect(AACommonService.setRestApiStatus).toHaveBeenCalled();
      expect(AACommonService.setIsValid).toHaveBeenCalled();
    });

    it('should populate the dynamicValues when isDynamic is false', function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
      actionEntry.url = [{
        action: {
          eval: {
            value: 'Static text',
          },
        },
        isDynamic: false,
        htmlModel: '',
      }];
      actionEntry.method = 'GET';
      aaUiModel[schedule].entries[0].addAction(actionEntry);
      var controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      controller.openConfigureApiModal();
      modal.resolve();
      $scope.$apply();
      expect(_.get(controller, 'dynamicValues[0].model', '')).toBe('Static text');
      expect(AACommonService.setRestApiStatus).toHaveBeenCalled();
      expect(AACommonService.setIsValid).toHaveBeenCalled();
    });
  });

  describe('activate', function () {
    it('should read and display an existing entry when isDynamic is false', function () {
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
      actionEntry.url = [{
        action: {
          eval: {
            value: 'Original-Caller-Name',
          },
        },
        isDynamic: false,
        htmlModel: '',
      }];
      aaUiModel[schedule].entries[0].addAction(actionEntry);
      var controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      expect(_.get(controller, 'dynamicValues.length', 0)).toBe(1);
      expect(_.get(controller, 'dynamicValues[0].model', '')).toBe('Original-Caller-Name');
    });

    it('should read and display an existing entry when isDynamic is true', function () {
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
      actionEntry.url = [{
        action: {
          eval: {
            value: 'Original-Caller-Name',
          },
        },
        isDynamic: true,
        htmlModel: '%3Caa-insertion-element%20element-text%3D%22Original-Caller-Number%22%20read-as%3D%22%22%20element-id%3D%22configureApiUrl%22%20aa-Element-Type%3D%22REST%22%3E%3C%2Faa-insertion-element%3E',
      }];
      aaUiModel[schedule].entries[0].addAction(actionEntry);
      var controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      expect(_.get(controller, 'dynamicValues.length', 0)).toBe(1);
      expect(_.get(controller, 'dynamicValues[0].model', '')).toBe('Original-Caller-Name');
      expect(_.get(controller, 'dynamicValues[0].htmlModel', '')).not.toBeNull();
    });
  });
});
