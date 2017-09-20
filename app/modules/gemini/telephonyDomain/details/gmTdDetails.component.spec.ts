import testModule from '../index';

describe('Component: gmTdDetails', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', '$state', '$modal', '$stateParams', 'gemService', 'Notification', 'TelephonyDomainService', '$modal', '$window');
    this.$stateParams.info = {
      customerId: 'ff808081527ccb3f0163116a3531593d',
      ccaDomainId: 'ff808081527ccb3f0153116a3531041e',
    };

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
    this.sites = [
      {
        ccaDomainid: '8a607bdb59baadf5015aaba2d1731b48',
        ccaDomainName: 'CCA_E_Atlas-Test-5_hmwd_00000',
        siteId: 858622,
        siteName: 'xiaoyuantest2',
        siteUrl: 'xiaoyuantest2.webex.com',
        mappingStatus: 4,
        completeTime: '2017-03-17 08:41:14',
        remedyTicketId: null,
        oldCcaDomainId: '8a607bdb59baadf5015a650a2003157e',
        oldCcaDomainName: 'CCA_E_Atlas-Test-5_hmwd_0520_Bing_TD_02',
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
        action: 'edit_td_move_site',
        actionFor: 'Telephony Domain',
        email: 'liqing@qa.webex.com',
      }];

    this.fakeModal = {
      result: {
        then: function (okCallback, cancelCallback) {
          this.okCallback = okCallback;
          this.cancelCallback = cancelCallback;
        },
      },
      ok: function (item) {
        this.result.okCallback(item);
      },
      cancel: function (type) {
        this.result.cancelCallback(type);
      },
    };

    this.countries = [ { countryId: 1, countryName: 'Albania' }, { countryId: 2, countryName: 'Algeria' } ];

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$modal, 'open').and.returnValue(this.fakeModal);
    spyOn(this.gemService, 'getRemedyTicket').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getNotes').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getHistories').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getTelephonyDomain').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'updateTelephonyDomainStatus').and.returnValue(this.$q.resolve());
    spyOn(this.$window, 'open');
  }

  function initComponent() {
    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.$state.current.data = {};
    this.compileComponent('gmTdDetails', { $scope: this.$scope });
    this.$scope.$apply();
  }

  function setParameter(key, value) {
    const preData = {
      links: [],
      content: {
        health: { code: 200, status: 'OK' },
        data: { body: [], returnCode: 0, trackId: '' },
      },
    };
    _.set(preData, key, value);
    return preData;
  }

  describe('$onInit', () => {

    it('should watch', function () {
      spyOn(this.$scope, '$on').and.callThrough();
      const currentTD = setParameter.call(this, 'content.data.body', this.telephonyDomain);
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve(currentTD));

      initComponent.call(this);
      this.controller.$onInit();
      this.$scope.$broadcast('detailWatch', { isEdit: true, domainName: 'testTitle', notes: this.notes, sitesLength: this.sites.length });
      expect(this.controller.isEdit).toBeTruthy();
    });

    it('Should call Notification.errorResponse when the http status is 404', function () {
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject({ status: 404 }));

      initComponent.call(this);
      this.$scope.$emit('detailWatch', { notes: this.notes, sitesLength: this.sites.length });
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
      expect(this.$window.open).toHaveBeenCalled();
      expect(this.view.find('.remedyTicket a')).toContainText(this.remedyTicket[0].remedyTicketId);
    });

    it('Should return correct data for TelephonyDomainService.getTelephonyDomain', function () {
      const Element = '.gm-td-side-panel .feature-name';
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.TelephonyDomainService.getNotes.and.returnValue(this.$q.reject( { status: 404 } ));
      this.TelephonyDomainService.getHistories.and.returnValue(this.$q.reject( { status: 404 } ));

      initComponent.call(this);
      expect(this.view.find(Element).get(1)).toHaveText(this.telephonyDomain.customerAttribute);
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


    it('Should call onSeeAllPhoneNumbers when click the phone numbers section in page', function () {
      const currentTD = setParameter.call(this, 'content.data.body', this.telephonyDomain);
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve(currentTD));

      initComponent.call(this);
      this.view.find('li.feature a').click();
      expect(this.$state.go).toHaveBeenCalled();
    });

    it('OnEdit', function () {
      const currentTD = setParameter.call(this, 'content.data.body', this.telephonyDomain);
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve(currentTD));

      this.gemService.setStorage('currentTelephonyDomain', { region: 'US' });
      initComponent.call(this);
      this.controller.onEditTD();
      this.fakeModal.ok();
      expect(this.controller.domainName).not.toBeEmpty();
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

  describe('TD status', () => {
    it('Should call Notification.errorResponse for submission cancellation when request or response error occurred', function () {
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.updateTelephonyDomainStatus.and.returnValue(this.$q.reject( { status: 404 } ));
      initComponent.call(this);
      this.controller.model = {
        telephonyDomainId: 'mockTelephonyDomainId',
        btnCancelLoading: true,
        btnCancelDisable: false,
      };
      this.controller.updateTelephonyDomainStatus('cancel');
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('Should call Notification.error for submission cancellation when the returnCode is not 0', function () {
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.preData.content.data.returnCode = 100;
      this.TelephonyDomainService.updateTelephonyDomainStatus.and.returnValue(this.$q.resolve( this.preData ));
      initComponent.call(this);
      this.controller.model = {
        telephonyDomainId: 'mockTelephonyDomainId',
        btnCancelLoading: true,
        btnCancelDisable: false,
      };
      this.controller.updateTelephonyDomainStatus('cancel');
      this.$scope.$apply();
      expect(this.Notification.error).toHaveBeenCalled();
    });

    it('Should cancel submission successfully', function () {
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.preData.content.data.returnCode = 0;
      this.TelephonyDomainService.updateTelephonyDomainStatus.and.returnValue(this.$q.resolve( this.preData ));
      initComponent.call(this);
      this.controller.model = {
        telephonyDomainId: 'mockTelephonyDomainId',
        btnCancelLoading: true,
        btnCancelDisable: false,
      };
      this.controller.updateTelephonyDomainStatus('cancel');
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalled();
    });

    it('Should open the modal dialog to confirm submission cancellation when cancel request', function () {
      this.preData.content.data.body = this.telephonyDomain;
      this.gemService.getRemedyTicket.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getTelephonyDomain.and.returnValue(this.$q.resolve( this.preData ));
      this.preData.content.data.returnCode = 0;
      this.TelephonyDomainService.updateTelephonyDomainStatus.and.returnValue(this.$q.resolve( this.preData ));
      initComponent.call(this);
      this.controller.onCancelSubmission();
      this.$scope.$apply();
      expect(this.$modal.open).toHaveBeenCalled();
    });
  });
});
