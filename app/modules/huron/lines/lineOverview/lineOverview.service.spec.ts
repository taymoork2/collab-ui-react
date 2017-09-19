import { LineOverviewData } from './index';
import { Line, LineConsumerType } from 'modules/huron/lines/services';
import { CallForward } from 'modules/huron/callForward';
import { AutoAnswerConst, AutoAnswer, AutoAnswerPhone, AutoAnswerMember } from 'modules/huron/autoAnswer';
import { SharedLine, SharedLinePlace, SharedLineUser, SharedLinePhone } from 'modules/huron/sharedLine';
import { Member } from 'modules/huron/members';

describe('Service: LineOverviewService', () => {
  beforeEach(function () {
    this.initModules('huron.line-overview');
    this.injectDependencies(
      'LineOverviewService',
      'LineService',
      'CallForwardService',
      'SharedLineService',
      'CallerIDService',
      'MediaOnHoldService',
      'FeatureToggleService',
      'AutoAnswerService',
      'HuronVoicemailService',
      'HuronUserService',
      '$rootScope',
      '$scope',
      '$q',
    );

    this.line = new Line({
      uuid: '0000001',
      primary: true,
      shared: false,
      internal: '12345',
      external: null,
      siteToSite: '710012345',
      incomingCallMaximum: 2,
      label: {
        value: 'someuser@some.com',
        appliesToAllSharedLines: false,
      },
    });
    this.callerId = {
      externalCallerIdType: 'EXT_CALLER_ID_COMPANY_NUMBER',
      companyNumber: '2234232',
      customCallerIdName: null,
      customCallerIdNumber: null,
    };

    this.sharedLines = [
      new SharedLine({
        uuid: '0001',
        primary: true,
        place: new SharedLinePlace({
          uuid: '0002',
          displayName: 'Scary Place',
        }),
        user: new SharedLineUser({
          uuid: null,
          firstName: null,
          lastName: null,
          userName: null,
        }),
        phones: [],
      }),
      new SharedLine({
        uuid: '0003',
        primary: false,
        place: new SharedLinePlace({
          uuid: null,
          displayName: null,
        }),
        user: new SharedLineUser({
          uuid: '0004',
          firstName: 'Scary',
          lastName: 'User',
          userName: 'scary.user@haunted.com',
        }),
        phones: [],
      }),
    ];

    this.sharedlinePhones = [
      new SharedLinePhone({
        uuid: '0005',
        description: 'Scary Place (Cisco 8845)',
        assigned: true,
      }),
      new SharedLinePhone({
        uuid: '0006',
        description: 'Scary Place (Cisco 8865)',
        assigned: false,
      }),
    ];

    this.newSharedLineMembers = [
      new Member({
        uuid: '0004',
        type: 'USER_REAL_USER',
        firstName: 'Scary',
        lastName: 'User',
        userName: 'scary.user@haunted.com',
        numbers: [],
      }),
      new Member({
        uuid: '0002',
        type: 'USER_PLACE',
        displayName: 'Scary Place',
        numbers: [],
      }),
    ];

    const autoAnswerRead = getJSONFixture('huron/json/autoAnswer/autoAnswer.json');
    const autoAnswerData: AutoAnswer = new AutoAnswer();
    _.forEach(_.get(autoAnswerRead, AutoAnswerConst.PHONES, []), (phone: AutoAnswerPhone) => {
      autoAnswerData.phones.push(
        new AutoAnswerPhone({
          uuid: phone.uuid,
          name: phone.name,
          description: phone.description,
          model: phone.model,
          enabled: phone.enabled,
          mode: phone.enabled ? phone.mode : undefined,
        }));
    });
    autoAnswerData.member = new AutoAnswerMember(_.get(autoAnswerRead, AutoAnswerConst.MEMBER));
    this.autoAnswer = autoAnswerData;
    this.lineMoh = '';

    this.callForward = new CallForward();
    this.lineOverview = new LineOverviewData();
    this.lineOverview.line = this.line;
    this.lineOverview.callForward = this.callForward;
    this.lineOverview.sharedLines = this.sharedLines;
    this.lineOverview.callerId = this.callerId;
    this.lineOverview.companyNumbers = [];
    this.lineOverview.autoAnswer = this.autoAnswer;
    this.lineOverview.voicemailEnabled = false;
    this.lineOverview.lineMoh = this.lineMoh;
    this.lineOverview.line.label.value = this.line.label.value;
    this.lineOverview.services = [];

    this.getLineDefer = this.$q.defer();
    spyOn(this.LineService, 'getLine').and.returnValue(this.getLineDefer.promise);

    spyOn(this.LineService, 'updateLine').and.returnValue(this.$q.resolve());

    this.createLineDefer = this.$q.defer();
    spyOn(this.LineOverviewService, 'createLine').and.returnValue(this.createLineDefer.promise);

    this.getCallForwardDefer = this.$q.defer();
    spyOn(this.CallForwardService, 'getCallForward').and.returnValue(this.getCallForwardDefer.promise);

    this.updateCallForwardDefer = this.$q.defer();
    spyOn(this.CallForwardService, 'updateCallForward').and.returnValue(this.updateCallForwardDefer.promise);

    this.getSharedLinesDefer = this.$q.defer();
    spyOn(this.SharedLineService, 'getSharedLineList').and.returnValue(this.getSharedLinesDefer.promise);

    this.createSharedLineDefer = this.$q.defer();
    spyOn(this.SharedLineService, 'createSharedLine').and.returnValue(this.createSharedLineDefer.promise);

    this.getSharedLinePhonesDefer = this.$q.defer();
    spyOn(this.SharedLineService, 'getSharedLinePhoneList').and.returnValue(this.getSharedLinePhonesDefer.promise);

    this.getCallerIdDefer = this.$q.defer();
    spyOn(this.CallerIDService, 'getCallerId').and.returnValue(this.getCallerIdDefer.promise);

    this.updateCallerIdDefer = this.$q.defer();
    spyOn(this.CallerIDService, 'updateCallerId').and.returnValue(this.updateCallerIdDefer.promise);

    this.getLineMohDefer = this.$q.defer();
    spyOn(this.MediaOnHoldService, 'getLineMedia').and.returnValue(this.getLineMohDefer.promise);

    this.updateLineMohDefer = this.$q.defer();
    spyOn(this.MediaOnHoldService, 'updateMediaOnHold').and.returnValue(this.updateLineMohDefer.promise);

    this.listCompanyNumbersDefer = this.$q.defer();
    spyOn(this.CallerIDService, 'listCompanyNumbers').and.returnValue(this.listCompanyNumbersDefer.promise);

    this.getAutoAnswerDefer = this.$q.defer();
    spyOn(this.AutoAnswerService, 'getSupportedPhonesAndMember').and.returnValue(this.getAutoAnswerDefer.promise);

    this.updateAutoAnswerDefer = this.$q.defer();
    spyOn(this.AutoAnswerService, 'updateAutoAnswer').and.returnValue(this.updateAutoAnswerDefer.promise);
    spyOn(this.AutoAnswerService, 'createUpdateAutoAnswerPayload').and.callThrough();

    spyOn(this.LineOverviewService, 'cloneLineOverviewData').and.callThrough();
    spyOn(this.$q, 'all').and.callThrough();

    this.userServiceDefer = this.$q.defer();
    spyOn(this.HuronUserService, 'getUserServices').and.returnValue(this.userServiceDefer.promise);

    this.getLineLabelDefer = this.$q.defer();
    spyOn(this.HuronUserService, 'getUserV2LineLabel').and.returnValue(this.getLineLabelDefer.promise);

    spyOn(this.HuronVoicemailService, 'isEnabledForUser').and.returnValue(false);
    spyOn(this.HuronVoicemailService, 'update').and.returnValue(this.$q.resolve(200));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));

    installPromiseMatchers();
  });

  describe('get existing line', () => {
    beforeEach(function () {
      this.getLineDefer.resolve(this.line);
      this.getCallForwardDefer.resolve(this.callForward);
      this.getSharedLinesDefer.resolve(this.sharedLines);
      this.getSharedLinePhonesDefer.resolve(this.sharedlinePhones);
      this.getCallerIdDefer.resolve(this.callerId);
      this.listCompanyNumbersDefer.resolve([]);
      this.getAutoAnswerDefer.resolve(this.autoAnswer);
      this.getLineMohDefer.resolve(this.lineMoh);
      this.userServiceDefer.resolve([]);
      this.getLineLabelDefer.resolve(this.line.label.value);
    });

    it('should call LineService.getLine and CallForward.getCallForward', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001').then((lineOverview) => {
        expect(lineOverview).toEqual(this.lineOverview);
      });
      this.$rootScope.$digest();
      expect(this.LineService.getLine).toHaveBeenCalled();
      expect(this.CallForwardService.getCallForward).toHaveBeenCalled();
      expect(this.SharedLineService.getSharedLineList).toHaveBeenCalled();
      expect(this.CallerIDService.getCallerId).toHaveBeenCalled();
      expect(this.AutoAnswerService.getSupportedPhonesAndMember).toHaveBeenCalled();
      expect(this.LineOverviewService.cloneLineOverviewData).toHaveBeenCalled();
      expect(this.MediaOnHoldService.getLineMedia).toHaveBeenCalled();
    });

    it('should return an exact copy of LineOverviewData when getOriginalConfig is called', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      expect(this.LineOverviewService.getOriginalConfig()).toEqual(this.lineOverview);
    });

    it('matchesOriginalConfig should return false when data passed in does not match', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      this.lineOverview.line.external = '+9725551212';
      expect(this.LineOverviewService.matchesOriginalConfig(this.lineOverview)).toBeFalsy();
    });

    it('matchesOriginalConfig should return true when data passed in does match', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      expect(this.LineOverviewService.matchesOriginalConfig(this.lineOverview)).toBeTruthy();
    });

    describe('update exising line', () => {
      beforeEach(function () {
        this.getLineDefer.resolve(_.cloneDeep(this.line));
        this.getCallForwardDefer.resolve(_.cloneDeep(this.callForward));
        this.getSharedLinesDefer.resolve(_.cloneDeep(this.sharedLines));
        this.getSharedLinePhonesDefer.resolve(_.cloneDeep(this.sharedlinePhones));
        this.getCallerIdDefer.resolve(_.cloneDeep(this.callerId));
        this.getAutoAnswerDefer.resolve(_.cloneDeep(this.autoAnswer));
        this.getLineMohDefer.resolve(_.cloneDeep(this.lineMoh));
      });
      it('should only update line when only line is changed', function () {
        const promise = this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
        promise.then((_lineOverviewData) => {
          _lineOverviewData.line.internal = '+9725551212';
          const promise2 = this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001', _lineOverviewData, []);
          promise2.then(() => {
            expect(this.LineService.updateLine).toHaveBeenCalled();
            expect(this.CallForwardService.updateCallForward).not.toHaveBeenCalled();
            expect(this.CallerIDService.updateCallerId).not.toHaveBeenCalled();
            expect(this.AutoAnswerService.updateAutoAnswer).not.toHaveBeenCalled();
            expect(this.MediaOnHoldService.updateMediaOnHold).not.toHaveBeenCalled();
          });
        });
        expect(promise).toBeResolved();
      });

      it('should only update callForward when only callForward is changed', function () {
        this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
        this.$rootScope.$digest();
        this.lineOverview.callForward.callForwardAll.destination = '88888';
        this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001', this.lineOverview, []);
        expect(this.LineService.updateLine).not.toHaveBeenCalled();
        expect(this.CallForwardService.updateCallForward).toHaveBeenCalled();
        expect(this.CallerIDService.updateCallerId).not.toHaveBeenCalled();
        expect(this.AutoAnswerService.updateAutoAnswer).not.toHaveBeenCalled();
        expect(this.MediaOnHoldService.updateMediaOnHold).not.toHaveBeenCalled();
      });

      it('should only update callerId when only callerId is changed', function () {
        this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
        this.$rootScope.$digest();
        this.lineOverview.callerId.externalCallerIdType = 'EXT_CALLER_ID_CUSTOM';
        this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001', this.lineOverview, []);
        expect(this.LineService.updateLine).not.toHaveBeenCalled();
        expect(this.CallForwardService.updateCallForward).not.toHaveBeenCalled();
        expect(this.$q.all).toHaveBeenCalledWith([]);
        expect(this.AutoAnswerService.updateAutoAnswer).not.toHaveBeenCalled();
        expect(this.MediaOnHoldService.updateMediaOnHold).not.toHaveBeenCalled();
      });

      it('should only update autoAnswer when only autoAnswer is changed', function () {
        const promise = this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
        promise.then(() => {
          this.lineOverview.autoAnswer.phones[0].mode = AutoAnswerConst.HEADSET;
          this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001', this.lineOverview, []);

          expect(this.LineService.updateLine).not.toHaveBeenCalled();
          expect(this.CallForwardService.updateCallForward).not.toHaveBeenCalled();
          expect(this.CallerIDService.updateCallerId).not.toHaveBeenCalled();
          expect(this.AutoAnswerService.createUpdateAutoAnswerPayload).toHaveBeenCalled();
          expect(this.AutoAnswerService.updateAutoAnswer).toHaveBeenCalled();
          expect(this.MediaOnHoldService.updateMediaOnHold).not.toHaveBeenCalled();
        });
        this.$rootScope.$digest();
        expect(promise).toBeResolved();

      });

      it('should only update Line Moh when only lineMoh is changed', function () {
        this.LineOverviewService.get(LineConsumerType.USERS, '12345', '0000001');
        this.$rootScope.$digest();
        this.lineOverview.lineMoh = 'sample-test-media';
        this.LineOverviewService.save(LineConsumerType.USERS, '12345', '0000001', this.lineOverview, []);
        expect(this.LineService.updateLine).not.toHaveBeenCalled();
        expect(this.CallForwardService.updateCallForward).not.toHaveBeenCalled();
        expect(this.CallerIDService.updateCallerId).not.toHaveBeenCalled();
        expect(this.AutoAnswerService.updateAutoAnswer).not.toHaveBeenCalled();
        expect(this.MediaOnHoldService.updateMediaOnHold).toHaveBeenCalled();
      });
    });
  });

  describe('change extension', () => {
    beforeEach(function () {
      this.getLineDefer.resolve(_.cloneDeep(this.line));
      this.getCallForwardDefer.resolve(_.cloneDeep(this.callForward));
      this.getSharedLinesDefer.resolve(_.cloneDeep(this.sharedLines));
      this.getSharedLinePhonesDefer.resolve(_.cloneDeep(this.sharedlinePhones));
      this.getCallerIdDefer.resolve(_.cloneDeep(this.callerId));
      this.getAutoAnswerDefer.resolve(_.cloneDeep(this.autoAnswer));
      this.listCompanyNumbersDefer.resolve([]);
      this.userServiceDefer.resolve([]);
      this.getLineMohDefer.resolve('');
      this.getLineLabelDefer.resolve(this.line.label.value);
    });

    it('save should call PUT after changing extension', function () {
      const promise = this.LineOverviewService.get(LineConsumerType.USERS, '12345', '0000001');
      promise.then((_lineOverviewData) => {
        _lineOverviewData.line.internal = '55555';
        _lineOverviewData.voicemailEnabled = true;
        const promise2 = this.LineOverviewService.save(LineConsumerType.USERS, '12345', '0000001', _lineOverviewData, []);
        promise2.then(() => {
          expect(this.HuronVoicemailService.update).toHaveBeenCalled();
        });
      });
      expect(promise).toBeResolved();
    });
  });

  describe('create new line', () => {
    beforeEach(function () {
      this.newLine = new Line();
      this.getLineDefer.resolve(this.newLine);
      this.getCallForwardDefer.resolve(this.callForward);
      this.getLineLabelDefer.resolve(this.line.label.value);
      this.updateCallForwardDefer.resolve(this.callForward);
      this.createSharedLineDefer.resolve([]);
      this.createLineDefer.resolve(this.line);
    });

    it('save should call LineOverviewService.createLine for new line', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345');
      this.$rootScope.$digest();

      expect(this.HuronUserService.getUserV2LineLabel).toHaveBeenCalled();

      const lineOverviewNewLine = new LineOverviewData();
      lineOverviewNewLine.line = this.newLine;
      lineOverviewNewLine.callForward = this.callForward;
      lineOverviewNewLine.line.internal = '12345';
      this.LineOverviewService.save(LineConsumerType.PLACES, '12345', this.newLine.uuid, lineOverviewNewLine, []);
      this.$rootScope.$digest();

      expect(this.LineOverviewService.createLine).toHaveBeenCalled();
      expect(this.CallForwardService.updateCallForward).toHaveBeenCalled();
      expect(this.LineService.updateLine).toHaveBeenCalled();
    });
  });

  describe('create new line with shared line member', () => {
    beforeEach(function () {
      this.newLine = new Line();
      this.getLineDefer.resolve(this.newLine);
      this.getCallForwardDefer.resolve(this.callForward);
      this.updateCallForwardDefer.resolve(this.callForward);
      this.createLineDefer.resolve(this.line);
      this.createSharedLineDefer.resolve(this.sharedLines);
    });

    it('save should call LineOverviewService.createLine for new line and new shared line members', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345');
      this.$rootScope.$digest();

      const lineOverviewNewLine = new LineOverviewData();
      lineOverviewNewLine.line = this.newLine;
      lineOverviewNewLine.callForward = this.callForward;
      lineOverviewNewLine.line.internal = '12345';
      this.LineOverviewService.save(LineConsumerType.PLACES, '12345', this.newLine.uuid, lineOverviewNewLine, this.newSharedLineMembers, []);
      this.$rootScope.$digest();

      expect(this.LineOverviewService.createLine).toHaveBeenCalled();
      expect(this.CallForwardService.updateCallForward).toHaveBeenCalled();
      expect(this.SharedLineService.createSharedLine).toHaveBeenCalled();
    });
  });
});
