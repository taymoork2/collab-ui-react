'use strict';

describe('Directive: aaRouteToQueue', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var element;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var queue = [{
    queueName: 'Test Queue',
    queueUrl: ''
  }];
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var menuId = 'menu1';

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;


    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaKey = keyIndex;
    $scope.menuId = menuId;
    $scope.queues = JSON.stringify(queue);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    element = $compile("<aa-route-to-queue aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0' aa-queues='" + $scope.queues + "'></aa-route-to-queue>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("aaRouteToQueue");
  });
});
