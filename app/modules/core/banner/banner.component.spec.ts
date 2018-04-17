import testModule from './index';

describe('Component: Banner', function () {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      '$scope',
      'Authinfo',
    );

    spyOn(this.$rootScope, '$on').and.callThrough();
    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(false);

    this.broadcast = 'TOGGLE_HEADER_BANNER';
    this.iconCss = 'icon-warning';
    this.translation = 'subscriptions.overageWarning';
    this.type = 'danger';

    this.initController = (): void => {
      this.controller = this.$componentController('crBanner', {
        $rootScope: this.$rootScope,
        $scope: this.$scope,
        Authinfo: this.Authinfo,
      }, {});
      this.controller.$onInit();
    };

    this.initComponent = (): void => {
      this.compileComponent('crBanner', {});
    };
  });

  it('should initialize with default values', function () {
    this.initController();

    expect(this.controller.iconCss).toBeUndefined();
    expect(this.controller.isReadonly).toBeFalsy();
    expect(this.controller.isVisible).toBeFalsy();
    expect(this.controller.type).toBeUndefined();
    expect(this.controller.translation).toBeUndefined();

    expect(this.$rootScope.$on).toHaveBeenCalledWith(this.broadcast, jasmine.any(Function));
  });

  it('should set variables as expected on broadcast', function () {
    this.initController();

    this.$rootScope.$broadcast(this.broadcast, {
      iconCss: this.iconCss,
      translation: this.translation,
      type: this.type,
      visible: true,
    });

    expect(this.controller.iconCss).toEqual(this.iconCss);
    expect(this.controller.isReadonly).toBeFalsy();
    expect(this.controller.isVisible).toBeTruthy();
    expect(this.controller.type).toEqual(this.type);
    expect(this.controller.translation).toEqual(this.translation);

    this.$rootScope.$broadcast(this.broadcast);
    expect(this.controller.isVisible).toBeFalsy();
  });

  it('html should react as expected', function () {
    const banner = 'cs-alert-banner.header-banner';
    const icon = `span.icon.${this.iconCss}`;
    this.initComponent();

    expect(this.view).not.toContainElement(banner);

    this.$rootScope.$broadcast(this.broadcast, {
      iconCss: this.iconCss,
      translation: this.translation,
      type: this.type,
      visible: true,
    });
    this.$scope.$apply();

    expect(this.view).toContainElement(banner);
    expect(this.view).toContainElement(icon);
    expect(this.view.find('span').last().text()).toEqual(this.translation);
  });
});
