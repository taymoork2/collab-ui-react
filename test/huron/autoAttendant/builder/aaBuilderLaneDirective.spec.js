'use strict';

describe('Directive: aaBuilderLane', function () {
  var $compile, $rootScope;
  var AAUiModelService;
  var aaUiModel = {
    openHours: {
      entries: []
    }
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_, _AAUiModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    AAUiModelService = _AAUiModelService_;
    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);
    aaUiModel['openHours']['entries'] = [];
    $rootScope.$digest();

    expect(element.html()).toContain("aa-add-step-icon");
    expect(element.html()).not.toContain("aa-builder-actions");
  });

  xit('should contain aa-builder-actions when aaUiModel[openHours][entries] is not empty', function () {
    var element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);
    aaUiModel['openHours']['entries'] = [];
    aaUiModel['openHours']['entries'][0] = {};
    $rootScope.schedule = 'openHours';

    $rootScope.$digest();

    expect(element.html()).toContain("aa-add-step-icon");
    expect(element.html()).toContain("aa-builder-actions");
  });
});
