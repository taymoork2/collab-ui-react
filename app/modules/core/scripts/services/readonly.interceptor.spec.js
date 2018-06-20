'use strict';

describe('ReadonlyInterceptor', function () {
  beforeEach(function () {
    this.initModules(require('./readonly.interceptor'));
    this.injectDependencies(
      '$q',
      '$state',
      'Authinfo',
      'Notification',
      'ReadonlyInterceptor'
    );
    spyOn(this.$q, 'reject');
    spyOn(this.Notification, 'notifyReadOnly');

    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
    spyOn(this.Authinfo, 'isPartnerReadOnlyAdmin').and.returnValue(false);
    spyOn(this.Authinfo, 'getUserOrgId').and.returnValue('fe5acf7a-6246-484f-8f43-3e8c910fc50d');
    spyOn(this.Authinfo, 'getUserId').and.returnValue('09bd9c92-bdd0-4dfb-832d-618494246be5');
  });

  describe('admin read-only mode', function () {
    runReadOnlyTests();
  });

  describe('partner admin read-only mode', function () {
    beforeEach(function () {
      this.Authinfo.isReadOnlyAdmin.and.returnValue(false);
      this.Authinfo.isPartnerReadOnlyAdmin.and.returnValue(true);
    });

    runReadOnlyTests();
  });

  describe('while not in read-only mode', function () {
    it('does not manipulate requests', function () {
      this.Authinfo.isReadOnlyAdmin.and.returnValue(false);
      this.Authinfo.isPartnerReadOnlyAdmin.and.returnValue(false);
      var config = {
        data: 'x',
        method: 'POST',
      };
      this.ReadonlyInterceptor.request(config);
      expect(this.$q.reject.calls.count()).toBe(0);
      expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
    });
  });
});

function runReadOnlyTests() {
  it('intercepts POST operations and creates a read-only notification', function () {
    this.ReadonlyInterceptor.request({
      data: 'x',
      method: 'POST',
    });
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });

  it('intercepts PUT operations and creates a read-only notification', function () {
    this.ReadonlyInterceptor.request({
      data: 'x',
      method: 'PUT',
    });
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });

  it('intercepts DELETE operations and creates a read-only notification', function () {
    this.ReadonlyInterceptor.request({
      data: 'x',
      method: 'DELETE',
    });
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });

  it('intercepts PATCH operations and creates a read-only notification', function () {
    this.ReadonlyInterceptor.request({
      data: 'x',
      method: 'PATCH',
    });
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });

  it('does not intercept read operations', function () {
    var config = {
      data: 'x',
      method: 'GET',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('allows CI patches to self (own user)', function () {
    var config = {
      url: 'https://identity.webex.com/identity/scim/fe5acf7a-6246-484f-8f43-3e8c910fc50d/v1/Users/09bd9c92-bdd0-4dfb-832d-618494246be5',
      method: 'PATCH',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('intercepts PATCH requests to other CI users)', function () {
    var config = {
      url: 'https://identity.webex.com/identity/scim/fe5acf7a-6246-484f-8f43-3e8c910fc50d/v1/Users/2c5c9a99-3ab4-4266-aeb1-e950f52ec806',
      method: 'PATCH',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });

  it('does not intercept white-listed paths', function () {
    var config = {
      method: 'PATCH',
      url: 'https://idbroker.webex.com/idb/oauth2/v1/access_token',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept users report white-listed paths', function () {
    var config = {
      method: 'POST',
      url: 'https://atlas-intb.ciscospark.com/admin/api/v1/csv/organizations/4ccdd247-9f7a-4ffe-b10d-64c7872b9cca/users/report',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept device search white-listed paths', function () {
    var config = {
      method: 'POST',
      url: 'https://csdm-a.wbx2.com/csdm/api/v1/organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/devices/_search',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept device get all ids white-listed paths', function () {
    var config = {
      method: 'POST',
      url: 'https://csdm-a.wbx2.com/csdm/api/v1/organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/devices/?field=url',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept device bulk csv export white-listed paths', function () {
    var config = {
      method: 'POST',
      url: 'https://csdm-a.wbx2.com/csdm/api/v1/organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/devices/bulk/export',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept device search white-listed paths', function () {
    var config = {
      method: 'POST',
      url: 'https://csdm-a.wbx2.com/csdm/api/v1/organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/devices/_search',
    };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);
  });

  it('does not intercept white-listed states', function () {
    var config = {
      data: 'x',
      method: 'PATCH',
    };
    // PATCH not allowed and should fail
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);

    // reset counts
    this.$q.reject.calls.reset();
    this.Notification.notifyReadOnly.calls.reset();

    // use a specific allowed state
    this.$state.current = { name: 'helpdesk' };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);

    // use a child of allowed state
    this.$state.current = { name: 'helpdesk.child' };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(0);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(0);

    // use a close substring, but not allowed state
    this.$state.current = { name: 'helpdeskfake' };
    this.ReadonlyInterceptor.request(config);
    expect(this.$q.reject.calls.count()).toBe(1);
    expect(this.Notification.notifyReadOnly.calls.count()).toBe(1);
  });
}
