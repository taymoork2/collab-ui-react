import accountLinkingModule from './index';

describe('Service: LinkedSitesWebExService', () => {

  beforeEach(function () {
    this.initModules(accountLinkingModule);
    this.injectDependencies(
      'LinkedSitesWebExService',
      '$http',
      'WebExXmlApiFact',
      '$httpBackend',
      '$q',
      '$scope',
      'LogMetricsService',
    );
  });


  describe('ci site linking', () => {
    it('patch includes trustedDomains if domains is included in parameters', function (done) {
      spyOn(this.LogMetricsService, 'logMetrics');
      spyOn(this.WebExXmlApiFact, 'getSessionTicket').and.returnValue(this.$q.resolve('coolTicket'));
      this.$httpBackend.expectPATCH(
        'https://coolsite.webex.com/wbxadmin/api/v1/sites/thissite/cilinking',
        {
          accountLinkingMode: 'whatever',
          trustedDomains: ['a', 'b'],
        })
        .respond(200, { foo: 'bar' });
      this.LinkedSitesWebExService.setCiSiteLinking(
        'coolsite',
        'whatever',
        ['a', 'b'],
      )
        .then((result) => {
          expect(result).toEqual({ foo: 'bar' });
          done();
        });
      this.$httpBackend.flush();
    });

    it('patch does NOT include trustedDomains if domains is not included in parameters', function (done) {
      spyOn(this.LogMetricsService, 'logMetrics');
      spyOn(this.WebExXmlApiFact, 'getSessionTicket').and.returnValue(this.$q.resolve('coolTicket'));
      this.$httpBackend.expectPATCH(
        'https://coolsite.webex.com/wbxadmin/api/v1/sites/thissite/cilinking',
        {
          accountLinkingMode: 'whatever',
        })
        .respond(200, { foo: 'bar' });
      this.LinkedSitesWebExService.setCiSiteLinking(
        'coolsite',
        'whatever',
      )
        .then((result) => {
          expect(result).toEqual({ foo: 'bar' });
          done();
        });
      this.$httpBackend.flush();
    });

    it('logs metrics', function (done) {
      spyOn(this.WebExXmlApiFact, 'getSessionTicket').and.returnValue(this.$q.resolve('coolTicket'));
      spyOn(this.LogMetricsService, 'logMetrics');
      this.$httpBackend.whenPATCH('https://coolsite.webex.com/wbxadmin/api/v1/sites/thissite/cilinking')
        .respond(200, { foo: 'bar' });
      this.LinkedSitesWebExService.setCiSiteLinking(
        'coolsite',
        'whatever',
      )
        .then(() => {
          expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
            'accountlinking20',
            'ACCOUNTLINKINGOPERATION',
            'PAGELOAD',
            200,
            jasmine.any(Object), // date
            1, // units
            {
              requestType: 'setCiSiteLinking',
              duration: jasmine.any(Number),
              parameters: jasmine.any(Object),
            },
          );
          done();
        });
      this.$httpBackend.flush();
    });
  });

});
