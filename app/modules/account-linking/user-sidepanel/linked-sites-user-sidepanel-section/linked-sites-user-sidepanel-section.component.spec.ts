import moduleName from './index';

describe('LinkedSitesUserSidepanelSectionComponent', () => {

  let $componentController, $q, $scope;

  let defaultUser: any = {
    name: 'Julius Caesar',
    entitlements: [],
  };

  afterAll(() => {
    defaultUser = undefined;
  });

  beforeEach(function () {
    this.initModules(moduleName);
  });

  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
  }

  function cleanup() {
    $componentController = $q = $scope = undefined;
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
    $scope.$apply();
    return ctrl;
  }

  it('should hasLinkedWebexSites to be false if user does not have linkedTrainSiteNames', () => {
    const ctrl = initController();

    expect(ctrl.hasLinkedWebexSites()).toBe(false);
    expect(ctrl.numLinkedWebexSites()).toBe(0);
  });

  it('should hasLinkedWebexSites to be true if attribute is set with correct value', () => {
    const userWithLinkedTrainSiteNames = {
      linkedTrainSiteNames: ['testsite.webex.com', 'testsite2.webex.com'],
    };

    const ctrl = initController(userWithLinkedTrainSiteNames);

    expect(ctrl.hasLinkedWebexSites()).toBe(true);
    expect(ctrl.numLinkedWebexSites()).toBe(2);
  });

});
