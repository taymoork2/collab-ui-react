'use strict';

describe('Directive: aaRouteToExtNum', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var menuId = 'menu1';

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
    $scope.keyIndex = keyIndex;
    $scope.menuId = menuId;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

    var menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', '+14084744088');
    menuKeyEntry.addAction(action);

    aaUiModel[schedule].entries[keyIndex].addEntry(menuKeyEntry);
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-route-to-ext-num aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0'></aa-route-to-ext-num>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aaRouteToExtNum");
  });
});
