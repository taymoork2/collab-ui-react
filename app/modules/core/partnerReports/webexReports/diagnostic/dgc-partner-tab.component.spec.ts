import moduleName from './index';

describe('Component: DgcPartnerTab', () => {
  beforeAll(function() {
    this.meetingDetail = {
      meetingBasicInfo: {
        status: 2,
        duration: 11641,
        endTime: 1502270705000,
        numberOfParticipants: 1,
        startTime: 1502259064000,
        meetingName: 'Felix cao',
        meetingNumber: '150912949',
        createdTime: 1484789489000,
        conferenceId: '69162350665578622',
      },
      features: { chat: null, poll: 1, appShare: 1 },
      connection: { voIP: 'yes', video: 'no', nbr2: 'yes' },
      sessions: [{ sessionType: '4', duration: 4000 }],
    };
    this.nameSection = '.meeting-room-name h3';
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', 'PartnerSearchService');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.PartnerSearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
  }

  it('should get correct meetingName', function () {
    this.PartnerSearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    this.compileComponent('dgcPartnerTab');

    expect(this.view.find(this.nameSection)).toHaveText('Felix cao');
  });

  it('should get Server time when the meeting status eq 1', function () {
    this.meetingDetail.meetingBasicInfo.status = 1;
    this.PartnerSearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    spyOn(this.PartnerSearchService, 'getServerTime').and.returnValue(this.$q.resolve({ dateLong: 1513319154000 }));
    this.compileComponent('dgcPartnerTab');

    const meeting = this.PartnerSearchService.getStorage('webexOneMeeting');
    expect(meeting.endTime).toBe(1513319154000);
  });
});
