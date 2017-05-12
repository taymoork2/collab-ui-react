'use strict';

describe('Factory : OverviewCrashLogNotification', function () {
  beforeEach(angular.mock.module('Core'));

  var crashLogNotification, Orgservice, Authinfo;

  beforeEach(inject(function (OverviewCrashLogNotification, _Orgservice_, _Authinfo_) {
    crashLogNotification = OverviewCrashLogNotification.createNotification();
    Orgservice = _Orgservice_;
    Authinfo = _Authinfo_;
  }));

  it('should set allowCrashLogUpload to true on dismiss', function () {
    Orgservice.setOrgSettings = jasmine.createSpy('setOrgSettings');
    Authinfo.getOrgId = jasmine.createSpy('getOrgId').and.returnValue('cisco');
    crashLogNotification.dismiss();
    expect(Orgservice.setOrgSettings.calls.argsFor(0)[1].allowCrashLogUpload).toBeTruthy();
  });
});
