import testModule from '../index';

describe('Component: gmTdDetails', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', '$state', '$stateParams', 'gemService', 'Notification', 'TelephonyDomainService');

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

    this.notes = [
      {
        id: 'e0a9fd96-635d-4261-bac4-241c164161fc',
        userId: 'feng5@mailinator.com',
        userName: 'Feng Wu-Partner Admin',
        actionTime: 'Mar 6, 2017 08:44:00',
        hasLogFile: false,
        objectID: null,
        objectName: 'gfd232',
        siteID: '8a607bdb59baadf5015a650a2003157e',
        customerID: 'ff808081527ccb3f0153116a3531041e',
        action: 'add_note',
        actionFor: 'Telephony Domain',
        email: 'feng5@mailinator.com',
      }];

    this.histories = [
      {
        id: '5ffc67d3-cd61-4edb-9db9-3d7e4d35d341',
        userId: '71449abf-0a5b-4866-9208-5073e010a186',
        userName: 'qing li',
        actionTime: 'Feb 22, 2017 08:58:24',
        hasLogFile: false,
        objectID: '0520_Bing_TD_02',
        objectName: null,
        siteID: '8a607bdb59baadf5015a650a2003157e',
        customerID: 'ff808081527ccb3f0153116a3531041e',
        action: 'submit_td_move_site',
        actionFor: 'Telephony Domain',
        email: 'liqing@qa.webex.com',
      }];
  });

  function initSpies() {
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.gemService, 'getRemedyTicket').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getTelephonyDomain').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getNotes').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getHistories').and.returnValue(this.$q.resolve());
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
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject({ status: 404 }));

      initComponent.call(this);
      this.$scope.$emit('refreshNotes', this.notes);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('Should call Notification.error for TelephonyDomainService.getTelephonyDomain when the returnCode is\'t 0', function () {
      this.preData.content.data.returnCode = 100;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

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
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

      initComponent.call(this);
      this.view.find('.remedyTicket a').click();
      expect(this.view.find('.remedyTicket a')).toContainText(this.remedyTicket[0].remedyTicketId);
    });

    it('Should return correct data for TelephonyDomainService.getTelephonyDomain', function () {
      let Element = '.side-panel-wrapper .side-panel-section';
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

      initComponent.call(this);
      expect(this.view.find(Element).first().find('span').first()).toContainText(this.telephonyDomain.customerAttribute);
    });

    it('Should call Notification.error for TD getNotes & getHistories when the returnCode is\'t 0', function () {
      this.preData.content.data.returnCode = 100;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.resolve( this.preData ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.resolve( this.preData ));

      initComponent.call(this);
      expect(this.Notification.error).toHaveBeenCalled();
    });

    it('Should get TD notes successfully', function () {
      this.preData.content.data.body = this.notes;
      this.preData.content.data.returnCode = 0;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.resolve( this.preData ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

      initComponent.call(this);
      expect(this.controller.notes.length).toBe(1);
    });

    it('Should get TD histories successfully', function () {
      this.preData.content.data.body = this.histories;
      this.preData.content.data.returnCode = 0;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.resolve( this.preData ));

      initComponent.call(this);
      expect(this.controller.histories.length).toBe(1);
    });

  });

  describe('TD histories', () => {
    it('click Show All Histories button', function () {
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

      initComponent.call(this);
      this.controller.onShowAllHistories();
      expect(this.controller.isShowAllHistories).toBeFalsy();
    });
  });

});
