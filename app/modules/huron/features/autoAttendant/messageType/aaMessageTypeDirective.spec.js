'use strict';

describe('Directive: aaMessageType', function () {
  var $compile, $rootScope;

  var AAUiModelService, AutoAttendantCeMenuModelService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    var menuEntry;

    $compile = _$compile_;
    $rootScope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    menuEntry.addAction(AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', 'http://www.test.com'));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.openHours.addEntryAt(0, menuEntry);

  }));

  it('creates the appropriate content as element', function () {
    var element = $compile("<aa-message-type aa-schedule='openHours' aa-index='0' name='messageType'></aa-message-type>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("messageType");
  });

});
