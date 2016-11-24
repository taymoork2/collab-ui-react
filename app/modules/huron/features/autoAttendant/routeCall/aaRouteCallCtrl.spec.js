'use strict';

describe('Controller: AARouteCallMenuCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService, QueueHelperService, AACommonService;
  var $rootScope, $scope, $q;
  var aaUiModel = {
    openHours: {}
  };
  var queueName = 'Sunlight Queue 1';
  var queues = [{
    queueName: queueName,
    queueUrl: '/c16a6027-caef-4429-b3af-9d61ddc7964b'

  }];

  var sortedOptions = [{
    "label": 'autoAttendant.phoneMenuRouteAA',
  }, {
    "label": 'autoAttendant.phoneMenuRouteHunt',
  }, {
    "label": 'autoAttendant.phoneMenuRouteQueue',
  }, {
    "label": 'autoAttendant.phoneMenuRouteToExtNum',
  }, {
    "label": 'autoAttendant.phoneMenuRouteUser',
  }, {
    "label": 'autoAttendant.phoneMenuRouteVM',
  }];
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($controller, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _QueueHelperService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    QueueHelperService = _QueueHelperService_;
    AACommonService = _AACommonService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(QueueHelperService, 'listQueues').and.returnValue($q.when(queues));

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = 'openHours';
    $scope.index = '0';
    aaUiModel['openHours'].addEntryAt($scope.index, AutoAttendantCeMenuModelService.newCeMenuEntry());

    controller = $controller;
  }));

  afterEach(function () {

  });

  describe('setSelects', function () {

    it('should add a new keyAction object into selectedActions array', function () {

      AACommonService.setRouteQueueToggle(false);

      controller = controller('AARouteCallMenuCtrl', {
        $scope: $scope
      });
      $scope.$apply();

      controller.menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
      controller.menuEntry.actions = [];

      var i, action;

      for (i = 0; i < controller.options.length; i++) {

        action = AutoAttendantCeMenuModelService.newCeActionEntry(controller.options[i].value, '');
        controller.menuEntry.actions[0] = action;
        controller.setSelects();
        expect(controller.selected.label).toEqual(controller.options[i].label);
      }

    });
  });

  /**
   * Lable value is not read from properties file in unit test cases. it will treat the key provided into vm.options for label
   * as text only. Sorting is based on the key itself and not on values of title.
   */
  describe('Activate ', function () {
    it('test for sorted options', function () {

      AACommonService.setRouteQueueToggle(true);

      controller = controller('AARouteCallMenuCtrl', {
        $scope: $scope
      });
      $scope.$apply();

      expect(controller.options.length).toEqual(sortedOptions.length);

      for (var i = 0; i < sortedOptions.length; i++) {
        expect(controller.options[i].label).toEqual(sortedOptions[i].label);
      }

    });
  });


});
