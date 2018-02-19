import linkedSitesUserSettingsModuleName from './index';

describe('LinkedSitesUserSettingsCtrl', () => {

  let $componentController, $q, $scope, UserOverviewService;

  beforeEach(function () {
    this.initModules(linkedSitesUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$componentController_, _$q_, _$rootScope_, _UserOverviewService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    UserOverviewService = _UserOverviewService_;
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
    expect(ctrl.haveLinkedWebexSites()).toBeFalsy();
    expect(ctrl.getPreferredWebExSite()).toEqual('');
  });

  it('should haveLinkedWebexSites return true when linkedTrainSiteNames attribute is set', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        linkedTrainSiteNames: ['testsite.webex.com'],
        userPreferences: ['\"calSvcPreferredWebexSite\":\"testsite.webex.com\"'],
      },
    }));

    const userId = '9876';
    const ctrl = initController(userId);

    expect(ctrl.haveLinkedWebexSites()).toBeTruthy();
    expect(ctrl.getPreferredWebExSite()).toEqual('');
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

    expect(ctrl.haveLinkedWebexSites()).toBeTruthy();
    expect(ctrl.getPreferredWebExSite()).toEqual('testsite.webex.com');
  });

});
