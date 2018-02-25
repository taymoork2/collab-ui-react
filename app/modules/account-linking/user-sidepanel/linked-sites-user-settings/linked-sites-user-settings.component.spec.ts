import moduleName from './index';

describe('LinkedSitesUserSettingsCtrl', () => {

  let $componentController, $q, $scope, UserOverviewService, Notification;

  beforeEach(function () {
    this.initModules(moduleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$componentController_, _$q_, _$rootScope_, _UserOverviewService_, _Notification_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    UserOverviewService = _UserOverviewService_;
    Notification = _Notification_;
  }

  function cleanup() {
    $componentController = $q = $scope = UserOverviewService = undefined;
  }

  function initSpies() {
    spyOn(UserOverviewService, 'getUser');
  }

  function initController(userId: string) {
    const ctrl = $componentController('linkedSitesUserSettings', {}, {});
    ctrl.$onChanges({
      userId: {
        currentValue: userId,
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get data from Common Identity on init', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: [],
      },
    }));

    const userId = '9876';
    const ctrl = initController(userId);

    expect(UserOverviewService.getUser.calls.count()).toBe(1);
    expect(UserOverviewService.getUser).toHaveBeenCalledWith(userId);
    expect(ctrl.hasLinkedWebexSites()).toBe(false);
    expect(ctrl.getPreferredWebExSite()).toBe('');
  });

  it('should hasLinkedWebexSites return true when linkedTrainSiteNames attribute is set', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        linkedTrainSiteNames: ['testsite.webex.com'],
        userPreferences: ['\"calSvcPreferredWebexSite\":\"testsite.webex.com\"'],
      },
    }));

    const userId = '9876';
    const ctrl = initController(userId);

    expect(ctrl.hasLinkedWebexSites()).toBe(true);
    expect(ctrl.getPreferredWebExSite()).toBe('');
  });

  it('should return preferredWebexSite when userPreferences have the correct attribute set', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        linkedTrainSiteNames: ['testsite.webex.com'],
        userPreferences: ['\"preferredWebExSite\":\"testsite.webex.com\"'],
      },
    }));

    const userId = '9876';
    const ctrl = initController(userId);

    expect(ctrl.hasLinkedWebexSites()).toBe(true);
    expect(ctrl.getPreferredWebExSite()).toBe('testsite.webex.com');
  });

});
