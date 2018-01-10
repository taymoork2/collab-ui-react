import testModule from './index';

describe('Component: tabParticipants', () => {
  beforeAll(function() {
    this.conferenceID = 123;
    this.participants = [
      { joinTime: 1515132340000, leaveTime: 1515140412000, userName: 'Bing', duration: 8071, reason: 76, platform: 1, browser: 6, sessionType: 0 },
      { joinTime: 1515132418000, leaveTime: 1515132989000, userName: 'Liu', duration: 571, reason: 0, platform: 1, browser: 6, sessionType: 0 },
    ];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService', 'Notification');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getParticipants').and.returnValue(this.$q.resolve());
  }

  function initComponent(this) {
    this.compileComponent('dgcTabParticipants', { cid: this.conferenceID });
    this.$scope.$apply();
  }

  it('Should not loading when call getParticipants', function () {
    this.SearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    initComponent.call(this);
    expect(this.controller.loading).toBe(false);
  });

  it('Should call Notification.errorResponse when response status is 404', function () {
    this.SearchService.getParticipants.and.returnValue(this.$q.reject({ status: 404 }));
    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });
});
