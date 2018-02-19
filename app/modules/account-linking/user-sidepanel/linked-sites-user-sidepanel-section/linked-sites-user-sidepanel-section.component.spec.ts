import linkedSitesUserSidepanelModuleName from './index';

describe('LinkedSitesUserSidepanelSectionComponent', () => {

  let $componentController, $q, $scope, FeatureToggleService;

  const defaultUser = {
    name: 'Julius Caesar',
    entitlements: [],
  };

  beforeEach(function () {
    this.initModules(linkedSitesUserSidepanelModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _FeatureToggleService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpies() {
    spyOn(FeatureToggleService, 'supports');
  }

  function cleanup() {
    $componentController = $q = $scope = FeatureToggleService = undefined;
  }

  function initController(user?) {
    const ctrl = $componentController('linkedSitesUserSidepanelSection', {}, {
      user: user || defaultUser,
    });
    ctrl.$onChanges({
      user: {
        currentValue: user || defaultUser,
      },
    });
    ctrl.$onInit();
    $scope.$apply();
    return ctrl;
  }

  it('should have feature toggle set to false by default on init', () => {
    FeatureToggleService.supports.and.returnValue($q.resolve(false));

    const ctrl = initController();

    expect(FeatureToggleService.supports).toHaveBeenCalled();
    expect(ctrl.atlasAccountLinkingPhase2).toBeFalsy();
    expect(ctrl.haveLinkedWebexSites()).toBeFalsy();
    expect(ctrl.numberOfLinkedWebexSites()).toEqual(0);
  });

  it('should haveLinkedWebexSites to be true if attribute is set with correct value', () => {
    FeatureToggleService.supports.and.returnValue($q.resolve(true));
    const userWithLinkedTrainSiteNames = {
      linkedTrainSiteNames: ['testsite.webex.com', 'testsite2.webex.com'],
    };

    const ctrl = initController(userWithLinkedTrainSiteNames);

    expect(FeatureToggleService.supports).toHaveBeenCalled();
    expect(ctrl.atlasAccountLinkingPhase2).toBeTruthy();
    expect(ctrl.haveLinkedWebexSites()).toBeTruthy();
    expect(ctrl.numberOfLinkedWebexSites()).toEqual(2);
  });

});
