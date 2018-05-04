import testModule from './index';
import { CoreEvent } from 'modules/core/shared/event.constants';

describe('Component: Banner', function () {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      '$scope',
    );

    spyOn(this.$rootScope, '$on').and.callThrough();

    this.broadcast = CoreEvent.HEADER_BANNER_TOGGLED;
    this.iconCss = 'icon-warning';
    this.translation = 'subscriptions.overageWarning';
    this.type = 'danger';

    this.initComponent = (): void => {
      this.compileComponent('crBanner', {});
    };
  });

  it('should initialize with default values', function () {
    this.initComponent();

    expect(_.size(this.controller.bannerList)).toBe(1);
    expect(this.controller.bannerList[0].name).toBe('REBRAND_BANNER_NAME');
    expect(this.$rootScope.$on).toHaveBeenCalledWith(this.broadcast, jasmine.any(Function));
  });

  it('should set variables as expected on broadcast', function () {
    this.initComponent();

    this.$rootScope.$broadcast(this.broadcast, {
      name: 'TEST_BANNER_NAME',
      iconCss: this.iconCss,
      translation: this.translation,
      type: this.type,
      closeable: true,
      isVisible: true,
    });
    this.$scope.$apply();

    expect(_.size(this.controller.bannerList)).toBe(2);
    const testBanner = _.cloneDeep(this.controller.bannerList[1]);
    expect(testBanner.iconCss).toEqual(this.iconCss);
    expect(testBanner.isVisible).toBeTruthy();
    expect(testBanner.type).toEqual(this.type);
    expect(testBanner.translation).toEqual(this.translation);
    expect(testBanner.closeable).toBeTruthy();

    this.$rootScope.$broadcast(this.broadcast, {
      name: 'TEST_BANNER_NAME',
    });
    this.$scope.$apply();
    expect(_.size(this.controller.bannerList)).toBe(1);
  });

  it('html should react as expected', function () {
    const banner = 'cs-alert-banner.header-banner';
    const icon = `span.icon.${this.iconCss}`;
    this.initComponent();

    this.$rootScope.$broadcast(this.broadcast, {
      name: 'TEST_BANNER_NAME',
      iconCss: this.iconCss,
      translation: this.translation,
      type: this.type,
      closeable: true,
      isVisible: true,
    });
    this.$scope.$apply();

    expect(this.view).toContainElement(banner);
    expect(this.view).toContainElement(icon);
    expect(this.view.find('span').last().text()).toEqual(this.translation);
  });
});
