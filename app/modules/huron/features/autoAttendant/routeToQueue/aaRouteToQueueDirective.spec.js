'use strict';

describe('Directive: aaRouteToQueue', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, QueueHelperService;

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

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _QueueHelperService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    QueueHelperService = _QueueHelperService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaKey = keyIndex;

    spyOn(QueueHelperService, 'listQueues').and.returnValue($q.when(queue));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-route-to-queue aa-schedule='openHours' aa-index='0' aa-key-index='0'></aa-route-to-queue>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("aaRouteToQueue");
  });
});
