import testModule from './index';

describe('Component: dgcTab', () => {
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
      features: { chat: null, poll: 1 },
      connection: { voIP: 'yes', video: 'no' },
    };
    this.nameSection = '.meeting-room-name h3';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.SearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
  }

  function initComponent(this) {
    this.compileComponent('dgcTab');
    this.$scope.$apply();
  }

  it('Should get correct meetingName', function () {
    this.SearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    initComponent.call(this);

    expect(this.view.find(this.nameSection)).toHaveText('Felix cao');
  });

  it('Should get Server time when the meeting status eq 1', function () {
    this.meetingDetail.meetingBasicInfo.status = 1;
    this.SearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    spyOn(this.SearchService, 'getServerTime').and.returnValue(this.$q.resolve({ dateLong: 1513319154000 }));
    initComponent.call(this);

    const oneM = this.SearchService.getStorage('webexOneMeeting');
    expect(oneM.endTime).toBe(1513319154000);
  });
});
