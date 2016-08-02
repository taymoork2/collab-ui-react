'use strict';

describe('Directive: aaScheduleInfo', function () {
  var $q, $compile, $rootScope, $scope;
  var AAICalService, AAModelService, AutoAttendantCeMenuModelService, AACalendarService;

  beforeEach(angular.mock.module('Huron'));
  var aaModel = {
    aaRecord: {
      scheduleId: '1',
      callExperienceName: 'AA1'
    },
    aaRecordUUID: '1111',
    ceInfos: []
  };
  var schedule = 'openHours';
  var aaUiModel = {
    openHours: {}
  };
  var openHours = [];
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');

  beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _AAModelService_, _AACalendarService_, _AAICalService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    AAModelService = _AAModelService_;
    AACalendarService = _AACalendarService_;
    AAICalService = _AAICalService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when());
    spyOn(AAICalService, 'getHoursRanges').and.returnValue($q.when(angular.copy(openHours)));
    $scope.schedule = schedule;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-schedule-info schedule='openHours'> </aa-schedule-info>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("aa-panel");
  });
});
