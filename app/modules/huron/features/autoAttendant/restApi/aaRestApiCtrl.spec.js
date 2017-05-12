'use strict';

describe('Controller: AARestApiCtrl', function () {
  var $controller, $modal;
  var AAUiModelService, AutoAttendantCeMenuModelService, AACommonService;
  var $rootScope, $scope;
  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;
  var fakeModal = {
    result: {
      then: function (okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
      },
    },
    close: function (item) {
      this.result.okCallback(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    },
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$modal_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $modal = _$modal_;

    $controller = _$controller_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AACommonService = _AACommonService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = 'menu1';

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AACommonService, 'setIsValid').and.callThrough();
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
  }));

  describe('openConfigureApiModal', function () {
    var controller;
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue(fakeModal);
      controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
    });

    it('should open the Modal on Validation success', function () {
      controller.openConfigureApiModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
    });

    it('should add imported items', function () {
      fakeModal.close();
      $scope.$apply();
      expect(AACommonService.setIsValid).toHaveBeenCalled();
    });

  });
});
