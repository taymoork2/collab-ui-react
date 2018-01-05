import testModule from './index';

describe('Component: dgcTabMeetingdetail', () => {
  beforeAll(function() {
    this.meeting = {
      endTime: 1513319315000,
      startTime: 1513319152000,
      featAndconn: [{ key: 'Chat', class: true, value: '40 Min' }],
      overview: { status: 2, conferenceId: '81296856363088285', createTime_: '2017-11-11' },
    };
    this.uniqueParticipants = {};
    this.createdTimeNode = '.overviewInfo li:first p:first';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');

    initSpies.apply(this);
  });

  function initSpies() {
    // spyOn(this.SearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
  }

  function initComponent(this) {
    this.compileComponent('dgcTabMeetingdetail');
    this.$scope.$apply();
  }

  it('Should get correct conferenceId from view', function () {
    this.SearchService.setStorage('webexOneMeeting', this.meeting);
    initComponent.call(this);

    expect(this.view.find(this.createdTimeNode)).toHaveText('2017-11-11');
  });

  xit('Should get Server time when status eq 1', function () {
    this.meeting.overview.status = 1;
    this.SearchService.setStorage('webexOneMeeting', this.meeting);
    spyOn(this.SearchService, 'getServerTime').and.returnValue(this.$q.resolve({ dateLong: 1513319154000 }));
    initComponent.call(this);

    const oneM = this.SearchService.getStorage('webexOneMeeting');
    expect(oneM.endTime).toBe(1513319154000);
  });

  it('should get sourceData and circleColor data', function () {
    this.SearchService.setStorage('webexOneMeeting', this.meeting);
    spyOn(this.SearchService, 'getUniqueParticipants').and.returnValue(this.$q.resolve(this.uniqueParticipants));
    initComponent.call(this);
  });
});
