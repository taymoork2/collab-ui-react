'use strict';

describe('Directive: aaDialByExt', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, FeatureToggleService;
  var element;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa',
    },
  };

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    $scope.schedule = 'OpenHours';
    $scope.index = '0';
    $scope.keyIndex = '0';
    $scope.menuId = 'menu1';
    $scope.routingPrefixOptions = '1002';

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.openHours.addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  afterEach(function () {
    $compile = null;
    $rootScope = null;
    $scope = null;
    $q = null;
  });

  it('replaces the element with the appropriate content', function () {
    element = $compile("<aa-dial-by-ext aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0' aa-routing-prefix-options='1002';></aa-dial-by-ext>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('aaDialByExtCtrl');
  });
});
