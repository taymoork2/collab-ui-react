import callForwardModule from './index';
import { CallForward } from './callForward';

describe('Component: callForward', () => {
  const CALL_FWD_NONE_RADIO = 'input#callForwardNone';
  const CALL_FWD_ALL_RADIO = 'input#callForwardAll';
  const CALL_FWD_BUSY_RADIO = 'input#callForwardBusy';
  const CALL_FWD_VOICEMAIL = 'input#allDirectVoicemail';
  const CALL_FWD_BUSY_VOICEMAIL = 'input#internalDirectVoicemail';
  const CALL_FWD_EXTERNAL_VOICEMAIL = 'input#externalDirectVoicemail';
  const CALL_FWD_BUSY_EXT_CHECK = 'input#ckForwardExternalCalls';
  const CALL_FWD_PHONE_NUMBER = 'input[name="phoneinput"]';
  const CALL_FWD_NOANSWER_TIMER = 'input[name="callForwardTimer"]';

  beforeEach(function() {
    this.initModules(callForwardModule);
    this.injectDependencies(
      '$scope', '$q', '$httpBackend',
    );
    this.$scope.userVoicemailEnabled = true;
    this.$scope.isPrimary = true;
    this.$scope.callForward = new CallForward();
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.ownerType = 'users';

    this.$httpBackend.whenGET(/.*\/organization\/scim\/v1\/Orgs\//).respond(200, { data: { countryCode: 'US' } });
  });

  function initComponent() {
    this.compileComponent('ucCallForward', {
      callForward: 'callForward',
      userVoicemailEnabled: 'userVoicemailEnabled',
      ownerType: 'ownerType',
      onChangeFn: 'onChangeFn(callForward)',
      isPrimary: 'isPrimary',
    });
    this.$httpBackend.flush();
  }

  describe('Call Forward None (initial state)', () => {
    beforeEach(initComponent);

    it('should have a callForwardNone radio button', function() {
      expect(this.view).toContainElement(CALL_FWD_NONE_RADIO);
    });

    it('should have a callForwardAll radio button', function() {
      expect(this.view).toContainElement(CALL_FWD_ALL_RADIO);
    });

    it('should have a callForwardBusy radio button', function() {
      expect(this.view).toContainElement(CALL_FWD_BUSY_RADIO);
    });

    it('should have callForwardAll checked initially', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).not.toBeChecked();
    });

    it('should have none of the select boxes visible', function() {
      expect(this.view).not.toContainElement(CALL_FWD_PHONE_NUMBER);
    });
  });

  describe('Call Forward All with voicemailEnabled = true', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_ALL_RADIO).click().click();
    });

    it('should show combo box when callForwardAll radio is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).not.toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
    });

    it('should have `Voicemail` checkbox in call forward all select list', function() {
      expect(this.view).toContainElement(CALL_FWD_VOICEMAIL);
    });

    it('should invoke `onChangeFn` when Voicemail option is selected', function() {
      const callForward = new CallForward();
      callForward.callForwardAll.voicemailEnabled = true;

      expect(this.view).toContainElement(CALL_FWD_VOICEMAIL);
      this.view.find(CALL_FWD_VOICEMAIL).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
    });
  });

  describe('Call Forward Busy with voicemailEnabled', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should show combo box when callForwardBusy radio is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
    });

    it('should have `Voicemail` checkbox in call forward busy ', function() {
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_BUSY_VOICEMAIL);
    });

    it('should invoke `onChangeFn` when Voicemail checkbox is selected', function() {
      const callForward = new CallForward();
      expect(this.view.find(CALL_FWD_BUSY_VOICEMAIL)).not.toBeChecked();
      callForward.callForwardBusy.internalVoicemailEnabled = true;
      callForward.callForwardBusy.externalVoicemailEnabled = true;
      this.view.find(CALL_FWD_BUSY_VOICEMAIL).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
    });
  });

  describe('Call Forward Busy External with voicemailEnabled', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should show combo box when `forward external calls differently` checkbox is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
      expect(this.view).toContainElement(CALL_FWD_EXTERNAL_VOICEMAIL);
    });

    it('should invoke `onChangeFn` when Busy External Voicemail checkbox is enabled', function() {
      const callForward = new CallForward();
      callForward.callForwardBusy.externalVoicemailEnabled = true;
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      this.view.find(CALL_FWD_EXTERNAL_VOICEMAIL).click();
      expect(this.view.find(CALL_FWD_EXTERNAL_VOICEMAIL)).toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
    });
  });

  describe('Call Forward All with voicemailEnabled = false and Destination number changed', () => {
    beforeEach(function () {
      //This is User Voicemail or system voicemail setting
      this.$scope.userVoicemailEnabled = true;
      this.$scope.isPrimary = true;
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_ALL_RADIO).click().click();
    });

    it('should not have `Voicemail` checkbox checkedin call forward all', function() {
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
      expect(this.view.CALL_FWD_BUSY_VOICEMAIL).not.toBeChecked();
    });

    it('should invoke `onChangeFn` when value is typed in call forward all combo box', function() {
      const callForward = new CallForward();
      callForward.callForwardAll.destination = '+19725551212';
      this.view.find(CALL_FWD_PHONE_NUMBER).val('+19725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
    });
  });

  describe('Call Forward Busy with User voicemailEnabled = false and Number changed', () => {
    beforeEach(function () {
      //This is User Voicemail or system voicemail setting
      this.$scope.userVoicemailEnabled = false;
      this.$scope.isPrimary = false;
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should invoke `onChangeFn` when value is typed in call forward busy combo box', function() {
      const callForward = new CallForward();
      callForward.callForwardBusy.internalDestination = '+19725551212';
      callForward.callForwardBusy.externalDestination = '+19725551212';
      this.view.find(CALL_FWD_PHONE_NUMBER).val('+19725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });

  describe('Call Forward Busy with ringDuration timer', () => {
    beforeEach(function () {
      this.$scope.voicemailEnabled = false;
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should have CFNA timer value default 25', function() {
      this.view.find(CALL_FWD_NOANSWER_TIMER).val('25');
    });

    it('should invoke `onChangeFn` when CFNA timer value is changed', function() {
      const callForward = new CallForward();
      callForward.callForwardBusy.internalVoicemailEnabled = true;
      callForward.callForwardBusy.externalVoicemailEnabled = true;
      this.view.find(CALL_FWD_BUSY_VOICEMAIL).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
      this.view.find(CALL_FWD_NOANSWER_TIMER).val(130).change();
      callForward.callForwardBusy.ringDurationTimer = 130;
      this.view.find(CALL_FWD_NOANSWER_TIMER).val('130').change().blur();
      expect(this.controller.isError).toBeFalsy();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });

    it('should validate the timer value when CFNA timer value is changed', function() {
      this.controller.callForwardTimer = 350;
      expect(this.controller.validateCallForwardTimer()).toBeFalsy();
      this.controller.callForwardTimer = -1;
      expect(this.controller.validateCallForwardTimer()).toBeFalsy();
      this.controller.callForwardTimer = 114;
      expect(this.controller.validateCallForwardTimer()).toBeTruthy();
    });
  });
});
