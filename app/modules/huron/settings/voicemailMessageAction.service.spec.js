'use strict';

describe('Service: VoicemailMessageAction', function () {
  var $httpBackend, HuronConfig, Authinfo, VoicemailMessageAction;

  beforeEach(angular.mock.module('Huron'));

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
      voicemailAction: 1
    }];

    it('should get messageAction', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions').respond(messageActions);

      var response = VoicemailMessageAction.get('1');
      $httpBackend.flush();

      expect(response.$$state.status).toEqual(1);
      expect(response.$$state.value.objectId).toEqual(messageActions[0].objectId);
      expect(response.$$state.value.voicemailAction).toEqual(messageActions[0].voicemailAction);
    });

    it('should get messageAction', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions').respond([]);

      var response = VoicemailMessageAction.get('1');
      $httpBackend.flush();

      expect(response.$$state.status).toEqual(2);
      expect(response.$$state.value).toBeDefined();
      expect(response.$$state.value.objectId).not.toBeDefined();
      expect(response.$$state.value.voicemailAction).not.toBeDefined();
    });
  });

  describe('update', function () {
    var messageAction = {
      voicemailAction: 3,
      relayAddress: 'dummy@test.xyz'
    };

    it('should update messageAction', function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates/1/messageactions/1', messageAction).respond(200);

      VoicemailMessageAction.update(true, '1', '1');
      $httpBackend.flush();
    });
  });

});
