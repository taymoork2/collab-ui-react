'use strict';

var testModule = require('./voicemail-message-action.service');

describe('Service: VoicemailMessageAction', function () {
  beforeEach(angular.mock.module(testModule));

  var $httpBackend, HuronConfig, Authinfo, VoicemailMessageAction;

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _Authinfo_, _VoicemailMessageAction_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Authinfo = _Authinfo_;
    VoicemailMessageAction = _VoicemailMessageAction_;

    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('get', function () {
    var messageActions = [{
      objectId: '1',
      voicemailAction: 1,
    }];

    it('should get messageAction', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions').respond(200, messageActions);

      VoicemailMessageAction.get('1').then(function (resp) {
        expect(resp.toJSON()).toEqual(messageActions[0]);
      });
      $httpBackend.flush();
    });

    it('should get messageAction', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions').respond([]);

      VoicemailMessageAction.get('1').then(fail)
        .catch(function (err) {
          expect(err).toBe('Failed to get voicemail to email settings.');
        });
      $httpBackend.flush();
    });
  });

  describe('update', function () {
    var messageAction = {
      voicemailAction: 3,
      relayAddress: 'dummy@test.xyz',
    };

    it('should update messageAction', function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions/1', messageAction).respond(200);

      VoicemailMessageAction.update(true, '1', '1');
      $httpBackend.flush();
    });
  });
});
