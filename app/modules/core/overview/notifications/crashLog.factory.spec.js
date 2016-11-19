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
    Orgservice.setOrgSettings = sinon.spy();
    Authinfo.getOrgId = sinon.stub().returns('cisco');
    crashLogNotification.dismiss();
    expect(Orgservice.setOrgSettings.getCall(0).args[1].allowCrashLogUpload).toBeTruthy();
  });
});
