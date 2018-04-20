'use strict';

describe('Controller: TrialNoticeBannerCtrl:', function () {
  var controller,
    $httpBackend,
    $q,
    Authinfo,
    Notification,
    TrialService,
    UserListService;

  var fakePartnerInfoData = {
    data: {
      partners: [{
        userName: 'fake-partner-email@example.com',
        displayName: 'fakeuser admin1',
        id: '2',
      }, {
        userName: 'fake-partner-email2@example.com',
        displayName: 'fakeuser admin2',
        id: '1',
      }],
    },
  };

  var fakeTrialPeriodData = {
    startDate: '2015-12-06T00:00:00.000Z',
    trialPeriod: 90,
  };

  var fakeConferenceDataWithWebex = [{
    license: {
      licenseType: 'CONFERENCING',
      siteUrl: 'test.webex.com',
    },
  }, {
    license: {
      licenseType: 'CONFERENCING',
    },
  }];

  var fakeConferenceDataWithoutWebex = [{
    license: {},
  }];

  afterEach(function () {
    controller = $httpBackend = $q = Authinfo = Notification = TrialService = UserListService = undefined;
  });

  afterAll(function () {
    fakePartnerInfoData = fakeTrialPeriodData = fakeConferenceDataWithWebex = fakeConferenceDataWithoutWebex = undefined;
  });

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  /* @ngInject */
  beforeEach(inject(function ($controller, _$httpBackend_, _$q_, _Authinfo_, _Notification_, _TrialService_, _UserListService_) {
    controller = $controller;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    UserListService = _UserListService_;

    spyOn(Notification, 'success');
    spyOn(Notification, 'errorWithTrackingId').and.callThrough();
    spyOn(UserListService, 'listPartnersAsPromise').and.returnValue($q.resolve(fakePartnerInfoData));
    $httpBackend.whenGET(/organization\/trials$/).respond(fakeTrialPeriodData);

    controller = controller('TrialNoticeBannerCtrl', {
      Authinfo: Authinfo,
      Notification: Notification,
      TrialService: TrialService,
      UserListService: UserListService,
    });

    $httpBackend.flush();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors:', function () {
    describe('canShow():', function () {
      it('should return true if "Authinfo.isUserAdmin()" is true and "TrialInfo.getTrialIds()" is not empty and the logged in user is not the partner', function () {
        spyOn(TrialService, 'getTrialIds').and.returnValue(['fake-uuid-value-1']);
        spyOn(Authinfo, 'isUserAdmin').and.returnValue(true);
        spyOn(Authinfo, 'getUserId').and.returnValue('1');
        expect(controller.canShow()).toBe(true);
      });

      it('should return true if "Authinfo.isUserAdmin()" is false', function () {
        spyOn(Authinfo, 'isUserAdmin').and.returnValue(false);
        spyOn(Authinfo, 'getUserId').and.returnValue('1');
        expect(controller.canShow()).toBe(false);
      });

      it('should return true if the logged in user is the partner', function () {
        spyOn(TrialService, 'getTrialIds').and.returnValue(['fake-uuid-value-1']);
        spyOn(Authinfo, 'isUserAdmin').and.returnValue(true);
        spyOn(Authinfo, 'getUserId').and.returnValue('2');
        expect(controller.canShow()).toBe(false);
      });
    });

    describe('sendRequest():', function () {
      it('should have called "TrialService.notifyPartnerTrialExt()"', function () {
        var fakePartnerNotifyResponse = {
          data: {
            notifyPartnerEmailStatusList: [],
          },
        };
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.resolve(fakePartnerNotifyResponse));

        controller.sendRequest().then(function () {
          expect(TrialService.notifyPartnerTrialExt).toHaveBeenCalled();
        });
      });
    });
  });

  describe('helper functions:', function () {
    describe('getPartnerInfo():', function () {
      describe('will resolve with partner data that...', function () {
        it('should have a "data.partners[0].displayName" property', function () {
          controller._helpers.getPartnerInfo().then(function () {
            expect(controller.partnerAdmin[0].userName).toBe('fake-partner-email@example.com');
            expect(controller.partnerAdmin[1].userName).toBe('fake-partner-email2@example.com');
          });
        });
      });
    });

    describe('getWebexSiteUrl():', function () {
      it('should return null without Conference Services', function () {
        spyOn(Authinfo, 'getConferenceServices').and.callFake(function () {
          return null;
        });
        var url = controller._helpers.getWebexSiteUrl();
        expect(url).toBe(null);
      });

      it('should return null when Conference Services without webex', function () {
        spyOn(Authinfo, 'getConferenceServices').and.callFake(function () {
          return fakeConferenceDataWithoutWebex;
        });
        var url = controller._helpers.getWebexSiteUrl();
        expect(url).toBe(null);
      });

      it('should return webex siteUrl when Conference Services with webex', function () {
        spyOn(Authinfo, 'getConferenceServices').and.callFake(function () {
          return fakeConferenceDataWithWebex;
        });
        var url = controller._helpers.getWebexSiteUrl();
        expect(url).toBe('test.webex.com');
      });
    });

    describe('sendRequest():', function () {
      it('should set requestResult to TOTAL_FAILURE when the request to notify partners fails', function () {
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.reject('error'));
        controller.sendRequest().then(fail)
          .catch(function (response) {
            expect(response).toBe('error');
            expect(Notification.errorWithTrackingId).toHaveBeenCalled();
            expect(Notification.errorWithTrackingId.calls.count()).toEqual(1);
            expect(controller.requestResult).toBe(controller.requestResultEnum.TOTAL_FAILURE);
          });
      });

      it('should set requestResult to TOTAL_FAILURE when the request to notify partners has no notifications', function () {
        var fakePartnerNotifyResponse = {
          data: {
            notifyPartnerEmailStatusList: [],
          },
        };
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.resolve(fakePartnerNotifyResponse));

        controller.sendRequest().then(function () {
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
          expect(Notification.errorWithTrackingId.calls.count()).toEqual(1);
          expect(controller.requestResult).toBe(controller.requestResultEnum.TOTAL_FAILURE);
        });
      });

      it('should set requestResult to TOTAL_FAILURE when the request to notify partners has all failed notifications', function () {
        var fakePartnerNotifyResponse = {
          data: {
            notifyPartnerEmailStatusList: [{
              adminEmail: 'fakeuserunodostres+admin1@gmail.com',
              status: 400,
            }, {
              adminEmail: 'fakeuserunodostres+admin2@gmail.com',
              status: 400,
            }],
          },
        };
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.resolve(fakePartnerNotifyResponse));

        controller.sendRequest().then(function () {
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
          expect(Notification.errorWithTrackingId.calls.count()).toEqual(1);
          expect(controller.requestResult).toBe(controller.requestResultEnum.TOTAL_FAILURE);
        });
      });

      it('should set requestResult to PARTIAL_FAILURE when the request to notify partners has some failed notifications', function () {
        var fakePartnerNotifyResponse = {
          data: {
            notifyPartnerEmailStatusList: [{
              adminEmail: 'fakeuserunodostres+admin1@gmail.com',
              status: 200,
            }, {
              adminEmail: 'fakeuserunodostres+admin2@gmail.com',
              status: 400,
            }],
          },
        };
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.resolve(fakePartnerNotifyResponse));

        controller.sendRequest().then(function () {
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
          expect(Notification.errorWithTrackingId.calls.count()).toEqual(1);
          expect(controller.requestResult).toBe(controller.requestResultEnum.PARTIAL_FAILURE);
        });
      });

      it('should set requestResult to SUCCESS when the request to notify partners has all successful notifications', function () {
        var fakePartnerNotifyResponse = {
          data: {
            notifyPartnerEmailStatusList: [{
              adminEmail: 'fakeuserunodostres+admin1@gmail.com',
              status: 200,
            }, {
              adminEmail: 'fakeuserunodostres+admin2@gmail.com',
              status: 200,
            }],
          },
        };
        spyOn(TrialService, 'notifyPartnerTrialExt').and.returnValue($q.resolve(fakePartnerNotifyResponse));

        controller.sendRequest().then(function () {
          expect(Notification.success).toHaveBeenCalled();
          expect(Notification.success.calls.count()).toEqual(1);
          expect(controller.requestResult).toBe(controller.requestResultEnum.SUCCESS);
        });
      });
    });
  });
});
