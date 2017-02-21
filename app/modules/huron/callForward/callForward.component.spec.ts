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
  const CALL_FWD_PHONE_NUMBER = 'div.phone-number input';

  beforeEach(function() {
    this.initModules(callForwardModule);
    this.injectDependencies(
      '$scope', 'HuronCustomerService', 'Authinfo', '$q',
    );
    this.$scope.voicemailEnabled = true;
    this.$scope.callForward = new CallForward();
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.HuronCustomerService, 'getVoiceCustomer').and.returnValue(this.$q.resolve({}));
    this.compileComponent('ucCallForward', {
      callForward: 'callForward',
      voicemailEnabled: 'voicemailEnabled',
      onChangeFn: 'onChangeFn(callForward)',
    });
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
      let callForward = new CallForward();
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
      let callForward = new CallForward();
      expect(this.view.find(CALL_FWD_BUSY_VOICEMAIL)).not.toBeChecked();
      callForward.callForwardBusy.internalVoicemailEnabled = true;
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
      let callForward = new CallForward();
      callForward.callForwardBusy.externalVoicemailEnabled = true;
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      this.view.find(CALL_FWD_EXTERNAL_VOICEMAIL).click();
      expect(this.view.find(CALL_FWD_EXTERNAL_VOICEMAIL)).toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
    });
  });

  describe('Call Forward All with voicemailEnabled = false', () => {
    beforeEach(function () {
      this.$scope.voicemailEnabled = false;
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_ALL_RADIO).click().click();
    });

    it('should not have `Voicemail` checkbox checkedin call forward all', function() {
      expect(this.view).toContainElement(CALL_FWD_PHONE_NUMBER);
      // expect(this.view.find(CALL_FWD_PHONE_NUMBER).find(DROPDOWN_OPTIONS)).toHaveLength(0);
      expect(this.view.CALL_FWD_BUSY_VOICEMAIL).not.toBeChecked();
    });

    it('should invoke `onChangeFn` when value is typed in call forward all combo box', function() {
      let callForward = new CallForward();
      callForward.callForwardAll.destination = '+19725551212';

      this.view.find(CALL_FWD_PHONE_NUMBER).val('9725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });

  describe('Call Forward Busy with voicemailEnabled = false', () => {
    beforeEach(function () {
      this.$scope.voicemailEnabled = false;
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should invoke `onChangeFn` when value is typed in call forward busy combo box', function() {
      let callForward = new CallForward();
      callForward.callForwardBusy.internalDestination = '+19725551212';
      this.view.find(CALL_FWD_PHONE_NUMBER).val('9725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callForward);
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });
});
