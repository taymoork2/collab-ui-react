'use strict';

describe('Directive: aaSubmenu', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService, AACommonService;

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
  var submenu;

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AACommonService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AACommonService = _AACommonService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaKey = keyIndex;
    $scope.menuId = menuId;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AACommonService, 'isRouteQueueToggle').and.returnValue(true);

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    var mainMenu = AutoAttendantCeMenuModelService.newCeMenu();
    mainMenu.headers[0] = AutoAttendantCeMenuModelService.newCeMenuEntry();
    mainMenu.headers[0].setType("MENU_OPTION_ANNOUNCEMENT");
    mainMenu.headers[1] = AutoAttendantCeMenuModelService.newCeMenuEntry();
    mainMenu.headers[1].setType("MENU_OPTION_DEFAULT");
    aaUiModel[schedule].addEntryAt(index, mainMenu);
    submenu = AutoAttendantCeMenuModelService.newCeMenu();
    submenu.attempts = 4;
    submenu.type = 'MENU_OPTION';
    submenu.key = '1';
    mainMenu.entries[0] = submenu;

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-submenu aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0'></aa-submenu>")($rootScope);
    $rootScope.$digest();

    // aa-say-message name="aa-submenu-say-message" aa-schedule="openHours" aa-menu-id="menu2" aa-index="index" aa-header="false"
    var htmlText = element.html();
    expect(htmlText).toContain('aa-header="false"');
    expect(htmlText).toContain('aa-schedule="openHours"');
    expect(htmlText).toContain('aa-menu-id="menu2"');
    expect(htmlText).toContain("aaSubmenu");
  });

  it('replaces the element with the appropriate content, with a say action on the first button of the submenu', function () {

    submenu.entries[0] = AutoAttendantCeMenuModelService.newCeMenuEntry();
    submenu.entries[0].type = 'MENU_OPTION';
    submenu.entries[0].addAction(AutoAttendantCeMenuModelService.newCeActionEntry('say', ''));

    var element = $compile("<aa-submenu aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0'></aa-submenu>")($rootScope);
    $rootScope.$digest();

    // aa-say-message name="aa-submenu-say-message" aa-schedule="openHours" aa-menu-id="menu2" aa-index="index" aa-header="false"
    var htmlText = element.html();
    expect(htmlText).toContain('aa-header="false"');
    expect(htmlText).toContain('aa-schedule="openHours"');
    expect(htmlText).toContain('aa-menu-id="menu2"');
    expect(htmlText).toContain("aaSubmenu");
    expect(htmlText).toContain('aa-key-index="0"');
  });
});
