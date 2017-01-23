'use strict';

describe('Directive: aaScheduleInfo', function () {
  var $q, $compile, $rootScope, $scope;
  var AAICalService, AAModelService, AACalendarService;
  var element;

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

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
  var openHours = [];

  beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _AAModelService_, _AACalendarService_, _AAICalService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    AAModelService = _AAModelService_;
    AACalendarService = _AACalendarService_;
    AAICalService = _AAICalService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.resolve());
    spyOn(AAICalService, 'getHoursRanges').and.returnValue($q.resolve(angular.copy(openHours)));
    $scope.schedule = schedule;
  }));

  it('replaces the element with the appropriate content', function () {
    element = $compile("<aa-schedule-info schedule='openHours'> </aa-schedule-info>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("aa-panel");
  });
});
