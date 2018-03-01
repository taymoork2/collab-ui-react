import testModule from '../index';

describe('Component: gmTdHistories', () => {
  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', 'Notification', 'gemService', 'TelephonyDomainService');
    this.mockData = [];
    this.mockData.push({
      action: 'action name',
      userName: 'bing',
      createdDate: new Date(),
    });
    this.mockData.push({
      action: 'add_notes_td',
      userName: 'bing',
      createdDate: new Date(),
    });
    this.mockData.push({
      action:  'Edit_td_move_site',
      userName: 'bing',
      createdDate: new Date(),
    });
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TelephonyDomainService, 'getHistories').and.returnValue(this.$q.resolve());
  }

  function initComponent(viaHttp: boolean = false, httpError: boolean = false) {
    this.gemService.setStorage('currentTelephonyDomain', {
      customerId: 'ff808081527ccb3f0153116a3531041e',
      ccaDomainId: '8a607bdb5b1280d3015b1353f92800cd',
      domainName: 'test0328a',
    });

    if (viaHttp) {
      this.TelephonyDomainService.getHistories.and.callFake(() => {
        if (httpError) {
          return this.$q.reject({ status: 404 });
        }
        return this.$q.resolve(this.mockData);
      });
    } else {
      const histories: any[] = [];
      for (let i = 0; i < 10; i++) {
        histories.push({
          objectName: 'title',
        });
      }
      this.gemService.setStorage('currentTdHistories', histories);
    }

    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.compileComponent('gmTdHistories', {});
    this.controller.onCollapse();
    this.$scope.$apply();
  }

  it('get histories from storage', function () {
    initComponent.apply(this);
    expect(this.controller.model.length).toBe(10);
  });

  it('get histories via http request', function () {
    initComponent.apply(this, [true]);
    expect(this.controller.model.length).toBe(2);
  });

  it('can collapse the histories', function () {
    initComponent.apply(this);
    this.controller.isCollapsed = false;
    this.controller.onCollapse();
    expect(this.controller.isCollapsed).toBeTruthy();
  });

  it('should response error when failed to get histories via http request', function () {
    initComponent.apply(this, [true, true]);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should display "Show All" link and click to show all histories', function () {
    initComponent.apply(this);
    this.controller.onShowAll();
    expect(this.controller.displayCount).toBe(this.controller.model.length);
  });
});
