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
    this.injectDependencies('$q', '$timeout', 'FeatureToggleService', 'Notification', 'SearchService');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getParticipants').and.returnValue(this.$q.resolve());
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  }

  function initComponent(this) {
    this.compileComponent('dgcTabParticipants', { cid: this.conferenceID });
    this.$scope.$apply();
  }

  it('should not loading when call getParticipants', function () {
    this.SearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    initComponent.call(this);
    expect(this.controller.loading).toBe(false);
  });

  it('should call Notification.errorResponse when response status is 404', function () {
    this.SearchService.getParticipants.and.returnValue(this.$q.reject({ status: 404 }));
    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should retry to detect and update device', function () {
    const mockRealDevice = {
      completed: true,
      items: [{
        deviceType: '',
      }],
    };
    spyOn(this.SearchService, 'getRealDevice').and.returnValue(this.$q.resolve(mockRealDevice));
    initComponent.call(this);
    this.controller.gridData = [{
      platform: '10',
      deviceCompleted: false,
    }];
    this.controller.reqtimes = 4;
    this.controller.detectAndUpdateDevice();
    this.$timeout.flush();
    expect(this.controller.reqtimes).toBe(5);
  });
});
