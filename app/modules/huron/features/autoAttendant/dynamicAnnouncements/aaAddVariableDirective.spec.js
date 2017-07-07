'use strict';

describe('Directive: aaAddVariable', function () {
  var $compile, $rootScope;
  var AutoAttendantCeMenuModelService, AAUiModelService;
  var element;
  var schedule = 'openHours';

  var ui = {
    openHours: {},
  };

  var uiMenu = {};
  var menuEntry = {};
  var index = '0';

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AutoAttendantCeMenuModelService_, _AAUiModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
  }));

  it('creates the appropriate content as element', function () {
    element = $compile('<aa-add-variable dynamic-prompt-id="id" dynamic-element-string="element" aa-schedule="openHours" aa-index="0"></aa-add-variable>')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('<button');
  });
});
