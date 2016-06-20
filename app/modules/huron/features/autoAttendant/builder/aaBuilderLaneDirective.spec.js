'use strict';

describe('Directive: aaBuilderLane', function () {
  var $compile, $rootScope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var FeatureToggleService;

  var aaUiModel = {};

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
  }));

  it('should NOT contain aa-builder-actions when aaUiModel[openHours] is empty', function () {
    aaUiModel['openHours'] = AutoAttendantCeMenuModelService.newCeMenu();
    $rootScope.schedule = 'openHours';
    $rootScope.index = 0;
    var element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-add-step-icon");
    expect(element.html()).not.toContain("aa-builder-actions");
  });

  it('should contain aa-builder-actions when aaUiModel[openHours] is not empty', function () {
    aaUiModel['openHours'] = AutoAttendantCeMenuModelService.newCeMenu();
    var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
    menuEntry.addAction(menuAction);
    aaUiModel['openHours'].addEntryAt(0, menuEntry);

    $rootScope.schedule = 'openHours';
    $rootScope.index = 0;
    var element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);

    $rootScope.$digest();

    expect(element.html()).toContain("aa-add-step-icon");
    expect(element.html()).toContain("aa-builder-actions");
  });
});
