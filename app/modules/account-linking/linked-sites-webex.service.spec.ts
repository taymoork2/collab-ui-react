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
    );
  });

  describe('ci site linking', () => {
    it('patch includes trustedDomains if domains is included in parameters', function (done) {
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
  });


});
