'use strict';

describe('Directive: aaDialByExt', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, FeatureToggleService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var schedule = 'schedule';

  beforeEach(module('Huron'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    $scope.schedule = 'OpenHours';
    $scope.index = '0';
    $scope.keyIndex = '0';

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.openHours.addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-dial-by-ext aa-schedule='openHours' aa-index='0' aa-key-index='0'></aa-dial-by-ext>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("aaDialByExtCtrl");
  });
});
