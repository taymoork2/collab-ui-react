import testModule from './index';

describe('Component: custWebexReportsMore', () => {
  beforeAll(function () {
    this.overview = { status_ : 'In Proccess', meetingNumber: 12345678, meetingName: 'webexMeeting', conferenceID: 234234234 };
    this.meetingDetail = {
      overview: {
        status: 1,
        startTime: 1499389211000,
        endTime: 1499399838000,
        duration: 1000,
        meetingName: 'test',
        conferenceID: '65168195997140080',
      },
      sessions: [
        {
          duration: '3',
          sessionType: '0',
          endTime: '2017-06-19 07:43:17',
          startTime: '2017-06-19 07:40:43',
        }, {
          duration: '30000',
          sessionType: '2',
          endTime: '2017-06-19 07:43:17',
          startTime: '2017-06-19 07:40:43',
        },
      ],
      participants: [],
    };
    this.participants = [{
      joinTime: 1499389211000,
      leaveTime: 1499399838000,
      conferenceID: '66735067305608980',
    }];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', 'Notification', 'SearchService');
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getStorage').and.returnValue(this.overview);
    spyOn(this.SearchService, 'getParticipants').and.returnValue(this.$q.resolve());
    spyOn(this.SearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.$state.current.data = {};
    this.compileComponent('custWebexReportsMore', {});
    this.$scope.$apply();
  }
  xit('Should show the correct data', function () {
    this.SearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    this.SearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));

    initComponent.call(this);
    expect(this.controller.dataSet.lines.length).toBe(1);
    expect(this.controller.data.overview.meetingName).toEqual('test');
  });

  xit('should notify in message for non 200 http status', function() {
    this.SearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    this.SearchService.getParticipants.and.returnValue(this.$q.reject({ status: 404 }));

    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

});
