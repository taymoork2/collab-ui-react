import { L2SipService } from './l2sip-service';

describe('L2SIP Service', () => {

  let service: L2SipService;
  const sipDestination = 'manunited.example.org';
  let validateTls: boolean;
  let $httpBackend;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies (_L2SipService_, _$httpBackend_): void {
    $httpBackend = _$httpBackend_;
    service = _L2SipService_;
  }

  describe(' verifySipDestination ', () => {
    afterEach( () => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it ('should call the DNS test tool with the correct SIP Destination and TLS validation settings', () => {

      validateTls = true;
      $httpBackend.expectGET(`https://l2sip-cfa-web.wbx2.com/l2sip/api/v1/test/dns?name=${sipDestination}&validateTls=${validateTls}`).respond('200');
      service.verifySipDestination(sipDestination, validateTls);
      $httpBackend.flush();

    });

    it ('should enforce TLS validation unless otherwise specified', () => {

      $httpBackend.expectGET(`https://l2sip-cfa-web.wbx2.com/l2sip/api/v1/test/dns?name=${sipDestination}&validateTls=true`).respond('200');
      service.verifySipDestination(sipDestination);
      $httpBackend.flush();

    });

  });

  describe('userTestCall', () => {

    afterEach( () => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should use the user test tool API with the correct caller and callee userIds', () => {

      const caller = '1234';
      const callee = '5678';

      $httpBackend.expectGET(`https://l2sip-cfa-web.wbx2.com/l2sip/api/v1/test/users?caller=${caller}&called=${callee}`).respond('200');
      service.userTestCall(caller, callee);
      $httpBackend.flush();

    });

  });

});
