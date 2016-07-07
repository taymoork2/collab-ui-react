'use strict';

describe('Directive: aaRouteToHg', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, HuntGroupService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var huntGroups = [{
    name: 'Olegs Hunt Group',
    numbers: ['987654321'],
    uuid: 'c16a6027-caef-4429-b3af-9d61ddc7964b'
  }];

  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _HuntGroupService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    HuntGroupService = _HuntGroupService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaKey = keyIndex;

    spyOn(HuntGroupService, 'getListOfHuntGroups').and.returnValue($q.when(huntGroups));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-route-to-hg aa-schedule='openHours' aa-index='0' aa-key-index='0'></aa-route-to-hg>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aaRouteToHG");
  });
});
