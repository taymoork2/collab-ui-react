import accountLinkingBannerModule from './index';
import { LinkingOriginator } from './../account-linking.interface';

describe('Component: accountLinkingBanner ', () => {

  let $componentController: ng.IComponentControllerService;
  let $state: ng.ui.IStateService;
  let ctrl;

  beforeEach(angular.mock.module(accountLinkingBannerModule));

  beforeEach(angular.mock.module(mockDependencies));

  function mockDependencies($provide) {
    const Authinfo = {
      getUserId: jasmine.createSpy('getUserId').and.returnValue(123),
      getConferenceServicesWithLinkedSiteUrl: jasmine.createSpy('getConferenceServicesWithLinkedSiteUrl').and.returnValue([1]),
    };
    $provide.value('Authinfo', Authinfo);
    const Userservice = {
      getUserAsPromise: () => {
        return {
          then: (success) => {
            return success();
          },
        };
      },
    };
    $provide.value('Userservice', Userservice);
  }

  beforeEach(inject((_$componentController_, _$state_) => {
    $componentController = _$componentController_;
    $state = _$state_;
  }));

  function initController(): ng.IComponentControllerService {
    return $componentController('accountLinkingBanner', {}, {});
  }

  it('should show banner if overview and has linked sites', () => {
    ctrl = initController();
    $state.current = {
      name: 'overview',
    };
    ctrl.$onInit();
    expect(ctrl.showBanner).toBe(true);
  });

  it('should show with link and change state', function () {
    ctrl = initController();
    $state.current = {
      name: 'overview',
    };
    ctrl.$onInit();
    spyOn($state, 'go');
    this.compileComponent('accountLinkingBanner');
    expect(this.view).toContainElement('a');

    this.view.find('a').click();
    expect($state.go).toHaveBeenCalledWith('site-list.linked', { originator: LinkingOriginator.Banner }, { reload: false });
  });

});
