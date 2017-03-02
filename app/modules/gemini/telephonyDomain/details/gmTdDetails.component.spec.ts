import testModule from '../index';

describe('Component: gmTdDetails', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', '$stateParams', 'gemService', 'Notification', 'TelephonyDomainService');

    initSpies.apply(this);
    this.$stateParams.info = {
      ccaDomainId: 'ff808081527ccb3f0153116a3531041e',
    };
  });

  beforeAll(function () {
    this.preData = {
      links: [],
      content: {
        health: { code: 200, status: 'OK' },
        data: { body: [], returnCode: 0, trackId: '' },
      },
    };

    this.telephonyDomain = {
      domainName: 'Hello domainName',
      customerAttribute: 'TD Partner Name',
      status: 'P',
      telephonyDomainSites: [{
        siteId: 858022,
        siteUrl: 'atlascca2.webex.com',
      }, {
        siteId: 858021,
        siteUrl: 'atlascca1.webex.com',
      }],
      telephonyNumberList: [{
        tollType: 'CCA Toll Free',
        phone: '055168885889',
        label: 'p5889',
      }, {
        tollType: 'CCA Toll',
        phone: '055168885888',
        label: 'p5888',
      }],
    };
    this.remedyTicket = [
      {
        type: 9,
        siteId: '0',
        id: 2696578,
        status: 'Assigned',
        createTime: 1488505209000,
        remedyTicketId: 'WO0000000053632',
        description: 'ff808081527ccb3f0153116a3531041e',
        ticketUrl: 'https://smbtrws.webex.com/arsys/forms/smbtars/SHR%3ALandingConsole/Default+Administrator+View/?mode=search&F304255500=WOI:WorkOrder&F1000000076=FormOpen&F303647600=SearchTicketWithQual&F304255610=%271000000182%27=%22WO0000000053632%22',
      }, {
        type: 9,
        siteId: '0',
        id: 2696577,
        status: 'Assigned',
        createTime: 1488504813000,
        remedyTicketId: 'WO0000000053631',
        description: 'ff808081527ccb3f0153116a3531041e',
        ticketUrl: 'https://smbtrws.webex.com/arsys/forms/smbtars/SHR%3ALandingConsole/Default+Administrator+View/?mode=search&F304255500=WOI:WorkOrder&F1000000076=FormOpen&F303647600=SearchTicketWithQual&F304255610=%271000000182%27=%22WO0000000053631%22',
      }];
  });

  function initSpies() {
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.gemService, 'getRemedyTicket').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getTelephonyDomain').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.$state.current.data = {};
    this.compileComponent('gmTdDetails', {});
    this.$scope.$apply();
  }

  describe('$onInit', () => {

    it('Should call Notification.errorResponse when the http status is 404', function () {
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject({ status: 404 }));

      initComponent.call(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('Should call Notification.error for TelephonyDomainService.getTelephonyDomain when the returnCode is\'t 0', function () {
      this.preData.content.data.returnCode = 100;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));

      initComponent.call(this);
      expect(this.Notification.error).toHaveBeenCalled();
    });

    it('Should return correct Remedy Ticket info', function() {
      let rt, td;
      rt = td = this.preData;
      rt.content.data = this.remedyTicket;
      td.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.resolve(rt));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( td ));

      initComponent.call(this);
      this.view.find('.remedyTicket a').click();
      expect(this.view.find('.remedyTicket a')).toContainText(this.remedyTicket[0].remedyTicketId);
    });

    it('Should return correct data for TelephonyDomainService.getTelephonyDomain', function () {
      let Element = '.side-panel-wrapper .side-panel-section';
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));

      initComponent.call(this);
      expect(this.view.find(Element).first().find('span').first()).toContainText(this.telephonyDomain.customerAttribute);
    });

  });
});
