import accountLinkingModule from './index';

describe('Service: LinkedSitesWebExService', () => {

  let $httpBackend: ng.IHttpBackendService;
  let LinkedSitesWebExService;

  const xmlResponse: string = '\
    <?xml version="1.0"?> \
    <serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns.use="http://www.webex.com/schemas/2002/06/service/user"> \
      <serv:header> \
        <serv:response> \
            <serv:result>SUCCESS</serv:result> \
            <serv:gsbStatus>PRIMARY</serv:gsbStatus> \
            </serv:response> \
        </serv:header> \
        <serv:body> \
            <serv:bodyContent xsi:type="use:authenticateUserResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> \
            <use:sessionTicket>AAABX0k3ZmkAABUYA0gAKEgyU0sAAAAEGxGKcuGfBGb9xPIKruRcvSN2XTRt7y3qD+yAa1WC9v5BSABmAQFIMlNLAAAABPx6tNm1WSgnt8Lag+nWT3xlAuLgh/vgK0q4UJlqMMYkU0sAAAAEunhzi1dtKejE/vD/RrmcT5N0Af9bcKuB6nge/OegTGxn/P+ROY5GZTm2OeE9M+lxtwHNkvK8vw6UuWpyim+VoLfMzq2z7ieoRuq2O2E+Fis/9Wozrx+h12zy5LFdD5v7RTHjqXtcwznmNomsRvunogEd1pXSDmk4oScX3DzM4EzLavZCdhFZTbXJbyP5rMJQnomQk/9AH51THFNyeLGbsZ/d4aKtchIKiIhEhKfJvmWlNty7gKkfS1aMDSpKEboOX/HxoV6Aa9rmtedqoPPl8l9GTEFHX0FERElOR19TSEEyNTZfQUxHT1JJVEhNXw==</use:essionTicket> \
            <use:createTime>1508761888360</use:createTime> \
            <use:timeToLive>5400</use:timeToLive> \
        </serv:bodyContent> \
      </serv:body> \
    </serv:message> \
  ';


  const webexXmlApiREgex: RegExp = /.*\/WBXService\/XMLService/;

  beforeEach(angular.mock.module(accountLinkingModule));
  beforeEach(inject((_$httpBackend_: ng.IHttpBackendService,
                     _LinkedSitesWebExService_,
                     _WebExUtilsFact_) => {
    $httpBackend = _$httpBackend_;
    LinkedSitesWebExService = _LinkedSitesWebExService_;
  }));

  beforeEach(() => {
    $httpBackend.whenPOST(webexXmlApiREgex).respond(() => {
      return xmlResponse;
    });
  });

});
