'use strict';

describe('Service: CloudConnectorService', function () {

  var CloudConnectorService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_CloudConnectorService_) {
    CloudConnectorService = _CloudConnectorService_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('fe5acf7a-6246-484f-8f43-3e8c910fc50d'),
      isFusionGoogleCal: sinon.stub().returns(true),
    };
    $provide.value('Authinfo', Authinfo);
  }

  describe('.getStatusCss()', function () {

    it('should just work', function () {
      expect(CloudConnectorService.getStatusCss(null)).toBe('default');
      expect(CloudConnectorService.getStatusCss({})).toBe('default');
      expect(CloudConnectorService.getStatusCss({ provisioned: false, status: 'OK' })).toBe('default');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'OK' })).toBe('success');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'ERROR' })).toBe('danger');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'WARN' })).toBe('warning');
    });
  });
});
