import testModule from './index';

describe('Component: custWebexReportsMore', () => {
  beforeAll(function () {
    this.overview = { status_ : 'In Proccess', meetingNumber: 12345678, meetingName: 'webexMeeting', conferenceID: 234234234 };
    this.meetingDetail = {
      overview: {
        conferenceID: '65168195997140080',
        meetingName: 'test',
        participantsSize: 1,
      },
      sessions: [
        {
          sessionType: '0',
          startTime: '2017-06-19 07:40:43',
          endTime: '2017-06-19 07:43:17',
          duration: '3',
        }, {
          sessionType: '1',
          startTime: '2017-06-19 07:40:46',
          endTime: '2017-06-19 07:43:27',
          duration: '3000000',
        },
      ],
      participants: [],
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', 'SearchService');
    spyOn(this.SearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
    spyOn(this.SearchService, 'getStorage').and.returnValue(this.overview);

  });

  function initComponent() {
    this.$state.current.data = {};
    this.compileComponent('custWebexReportsMore', {});
    this.$scope.$apply();
  }
  it('Should show the correct data', function () {
    this.SearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));

    initComponent.call(this);
    expect(this.controller.data.overview.meetingName).toEqual('test');
  });
});
