import testModule from '../index';

describe('Component: gmTdNotesView', () => {
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
    for (let i = 0; i < 5; i++) {
      this.mockData.content.data.body.push({
        userName: 'bing',
        objectName: 'note content',
      });
    }
    this.postMockData = {
      content: {
        data: {
          returnCode: 0,
          body: {
            userName: '',
            objectName: 'new note',
          },
        },
      },
    };
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TelephonyDomainService, 'getNotes').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'postNotes').and.returnValue(this.$q.resolve());
  }

  function initComponent(viaHttp: boolean = false, httpError: boolean = false) {
    this.gemService.setStorage('currentTelephonyDomain', {
      customerId: 'ff808081527ccb3f0153116a3531041e',
      ccaDomainId: '8a607bdb5b1280d3015b1353f92800cd',
      domainName: 'test0328a',
    });

    let notes: any[] = [];
    if (viaHttp) {
      if (httpError) {
        this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      } else {
        this.TelephonyDomainService.getNotes.and.returnValue(this.$q.resolve(this.mockData));
      }
    } else {
      for (let i = 0; i < 10; i++) {
        notes.push({
          objectName: 'title',
        });
      }
    }
    this.gemService.setStorage('currentTdNotes', notes);
    this.compileComponent('gmTdNotesView', {});
    this.controller.onCollapse();
    this.$scope.$apply();
  }

  it('get notes via http request', function () {
    initComponent.apply(this, [true]);
    expect(this.controller.model.length).toBe(5);
  });

  it('get notes from storage', function () {
    initComponent.apply(this, [false]);
    expect(this.controller.model.length).toBe(10);
  });

  it('can collapse the notes', function () {
    initComponent.apply(this);
    this.controller.isCollapsed = false;
    this.controller.onCollapse();
    expect(this.controller.isCollapsed).toBeTruthy();
  });

  it('failed to get notes when the returnCode is not 0', function () {
    this.mockData.content.data.returnCode = 100;
    initComponent.apply(this, [true]);
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should response error when failed to get histories', function () {
    initComponent.apply(this, [true, true]);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should display "Show All" link and click to show all notes', function () {
    initComponent.apply(this);
    this.controller.onShowAll();
    expect(this.controller.displayCount).toBe(this.controller.model.length);
  });

  it('add note successfully', function () {
    this.TelephonyDomainService.postNotes.and.returnValue(this.$q.resolve(this.postMockData));
    initComponent.apply(this);
    this.controller.onShowAll();
    this.controller.newNote = 'test测试ࠀ▓『』₱♔চীন' + String.fromCharCode(0xFFFF);
    this.controller.onSave();
    this.$scope.$apply();
    expect(this.controller.model.length).toBe(11);
  });

  it('should be failed when add note which is more than maximum length', function () {
    initComponent.apply(this);
    this.controller.newNote = `
    01234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890
    01234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890012345678900123456789001234567890
    01234567890012345678900123456789001234567890`;
    this.controller.onSave();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should throw error message when the response body is null', function () {
    this.postMockData.content.data.body = null;
    this.TelephonyDomainService.postNotes.and.returnValue(this.$q.resolve(this.postMockData));
    initComponent.apply(this);
    this.controller.newNote = 'test';
    this.controller.onSave();
    this.$scope.$apply();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should throw error message when the returnCode is not 0', function () {
    this.postMockData.content.data.returnCode = 100;
    this.TelephonyDomainService.postNotes.and.returnValue(this.$q.resolve(this.postMockData));
    initComponent.apply(this);
    this.controller.newNote = 'test';
    this.controller.onSave();
    this.$scope.$apply();
    expect(this.Notification.error).toHaveBeenCalled();
  });
});
