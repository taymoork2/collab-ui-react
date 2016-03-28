'use strict';

describe('Directive: aaTimeOutInvalid', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService, HuntGroupService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $scope.schedule = schedule;
    $scope.index = index;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-timeout-invalid aa-schedule='openHours' aa-index='0'></aa-timeout-invalid")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aaTimeoutInvalid");
  });
});
