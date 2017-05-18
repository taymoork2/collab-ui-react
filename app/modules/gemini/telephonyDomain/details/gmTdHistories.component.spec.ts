import testModule from '../index';

describe('Component: gmTdHistories', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'Notification', 'gemService', 'TelephonyDomainService');
    this.mockData = {
      content: {
        data: {
          returnCode: 0,
          body: [],
        },
      },
    };
    this.mockData.content.data.body.push({
      action: 'action name',
      userName: 'bing',
      createdDate: new Date(),
    });
    this.mockData.content.data.body.push({
      action: 'add_notes_td',
      userName: 'bing',
      createdDate: new Date(),
    });
    this.mockData.content.data.body.push({
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
      if (httpError) {
        this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));
      } else {
        this.TelephonyDomainService.getHistories.and.returnValue(this.$q.resolve(this.mockData));
      }
    } else {
      let histories: any[] = [];
      for (let i = 0; i < 10; i++) {
        histories.push({
          objectName: 'title',
        });
      }
      this.gemService.setStorage('currentTdHistories', histories);
    }

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

  it('failed to get histories when the returnCode is not 0', function () {
    this.mockData.content.data.returnCode = 100;
    initComponent.apply(this, [true, false]);
    expect(this.Notification.error).toHaveBeenCalled();
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
