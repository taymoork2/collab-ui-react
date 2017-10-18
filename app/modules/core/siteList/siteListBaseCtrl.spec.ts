describe('Controller: WebExSiteBaseCtrl ', function () {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller', '$state');
  });

  it('no tabs', function () {
    this.initController = (): void => {
      this.controller = this.$controller('WebExSiteBaseCtrl', {
        $state: this.$state,
        $stateParams: { accountLinkingV2: false },
      });
    };
    this.initController();
    expect(this.controller.tabs.length).toEqual(0);
  });

  it('state site-list forwards to state site-list.not-linked', function () {

    spyOn(this.$state, 'go');
    this.$state.current.name = 'site-list';

    this.initController = (): void => {
      this.controller = this.$controller('WebExSiteBaseCtrl', {
        $state: this.$state,
        $stateParams: { accountLinkingV2: false },
      });
    };
    this.initController();
    expect(this.controller.tabs.length).toEqual(0);
    expect(this.$state.go).toHaveBeenCalledWith('site-list.not-linked');
    expect(this.isAccountLinkingV2).toBeFalsy();

  });

  describe('account linking v2', function () {
    it('show two tabs', function () {
      this.initController = (): void => {
        this.controller = this.$controller('WebExSiteBaseCtrl', {
          $state: this.$state,
          $stateParams: { accountLinkingV2: true },
        });
      };
      this.initController();
      expect(this.controller.tabs.length).toEqual(2);
    });
  });
});
