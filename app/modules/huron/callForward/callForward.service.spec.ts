import { CallForward } from './callForward';
import { LineConsumerType } from '../lines/services';

describe('Service: CallForwardService', () => {
  beforeEach(function () {
    this.initModules('huron.call-forward');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'CallForwardService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    const getCallForwardResponse: CallForward = new CallForward();

    this.getCallForwardResponse = getCallForwardResponse;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get callforward data for a place', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/callforwards')
      .respond(200, this.getCallForwardResponse);
    this.CallForwardService.getCallForward(LineConsumerType.PLACES, '12345', '0000000').then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.getCallForwardResponse));
    });
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/callforwards').respond(500);
    this.CallForwardService.getCallForward(LineConsumerType.PLACES, '12345', '0000000').then(fail)
      .catch(response => {
        expect(response.data).toBeUndefined();
        expect(response.status).toEqual(500);
      });
    this.$httpBackend.flush();
  });

  it('should get callforward data for a user', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345/numbers/0000000/features/callforwards')
      .respond(200, this.getCallForwardResponse);
    this.CallForwardService.getCallForward(LineConsumerType.USERS, '12345', '0000000').then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.getCallForwardResponse));
    });
    this.$httpBackend.flush();
  });

  it('should send proper PUT payload', function () {
    const callForward = new CallForward();
    callForward.callForwardBusy.internalDestination = '5555551212';
    callForward.callForwardBusy.externalDestination = '5555559999';
    callForward.callForwardBusy.ringDurationTimer = 30;

    const callForwardPutPayload = {
      callForwardAll: {
        destination: null,
        voicemailEnabled: false,
      },
      callForwardBusy: {
        externalDestination: '5555559999',
        externalVoicemailEnabled: false,
        internalDestination: '5555551212',
        internalVoicemailEnabled: false,
      },
      callForwardNoAnswer: {
        externalDestination: '5555559999',
        externalVoicemailEnabled: false,
        internalDestination: '5555551212',
        internalVoicemailEnabled: false,
        ringDurationTimer: 30,
      },
      callForwardNotRegistered: {
        externalDestination: '5555559999',
        externalVoicemailEnabled: false,
        internalDestination: '5555551212',
        internalVoicemailEnabled: false,
      },
    };

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/callforwards', callForwardPutPayload).respond(200);
    this.CallForwardService.updateCallForward(LineConsumerType.PLACES, '12345', '0000000', callForward);
    this.$httpBackend.flush();
  });

});
