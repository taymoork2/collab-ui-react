'use strict';

describe('Directive: aaSayMessage', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService;

  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-say-message aa-schedule='openHours' aa-index='0'></aa-say-message>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-message-textarea");
  });
});
