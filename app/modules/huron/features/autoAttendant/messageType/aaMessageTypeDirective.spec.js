'use strict';

describe('Directive: aaMessageType', function () {
  var $compile, $rootScope;
  var element;
  var q;

  var AAUiModelService, AutoAttendantCeMenuModelService, AASessionVariableService, AAModelService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa',
    },
  };

  var aaModel = {
    aaRecord: {
      scheduleId: '1',
      callExperienceName: 'AA1',
    },
    aaRecords: [{
      callExperienceURL: 'url-1/1111',
      callExperienceName: 'AA1',
    }, {
      callExperienceURL: 'url-2/1112',
      callExperienceName: 'AA2',
    }],
    aaRecordUUID: '1111',
    ceInfos: [],
  };

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $q, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AASessionVariableService_, _AAModelService_) {
    var menuEntry;
    q = $q;

    $compile = _$compile_;
    $rootScope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AASessionVariableService = _AASessionVariableService_;
    AAModelService = _AAModelService_;

    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    menuEntry.addAction(AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', 'http://www.test.com'));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AASessionVariableService, 'getSessionVariablesOfDependentCeOnly').and.returnValue(q.resolve(customVarJson));
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.openHours.addEntryAt(0, menuEntry);
  }));

  it('creates the appropriate content as element', function () {
    element = $compile("<aa-message-type aa-schedule='openHours' aa-index='0' name='messageType'></aa-message-type>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('messageType');
  });
});
