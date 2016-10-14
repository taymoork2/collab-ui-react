'use strict';

describe('Directive: aaMediaUpload', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, FeatureToggleService;

  var ui = {
    openHours: {}
  };
  var uiMenu = {};
  var menuEntry = {};
  var schedule = 'openHours';
  var index = '0';
  var elementHtml = "<aa-media-upload aa-schedule='openHours' aa-index='0' name='mediaUploadInput'></aa-media-upload>";
  var attributeHtml = "<div aa-media-upload aa-schedule='openHours' aa-index='0' name='mediaUploadInput'></div>";

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    $scope.schedule = schedule;
    $scope.index = index;
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);
  }));

  describe('when the directive is an element', function () {
    var element;
    beforeEach(function () {
      element = $compile(elementHtml)($rootScope);
      $rootScope.$digest();
    });

    it('creates the appropriate content as element', function () {
      expect(element.html()).toContain("mediaUpload");
    });
  });

  describe('when the directive is an attribute', function () {
    var element;
    beforeEach(function () {
      element = $compile(attributeHtml)($rootScope);
      $rootScope.$digest();
    });

    it('creates the appropriate content as attribute', function () {
      expect(element.html()).toContain("mediaUpload");
    });
  });
});
