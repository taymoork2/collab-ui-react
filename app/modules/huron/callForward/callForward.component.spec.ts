import callForwardModule from './index';
import {
  CallForwardAll,
  CallForwardBusy
} from './callForward';

describe('Component: callForward', () => {
  const CALL_FWD_NONE_RADIO = 'input#callForwardNone';
  const CALL_FWD_ALL_RADIO = 'input#callForwardAll';
  const CALL_FWD_BUSY_RADIO = 'input#callForwardBusy';
  const CALL_FWD_BUSY_EXT_CHECK = 'input#ckForwardExternalCalls';
  const CALL_FWD_ALL_SELECT = '.csSelect-container[name="forwardAllCalls"]';
  const CALL_FWD_BUSY_SELECT = '.csSelect-container[name="forwardNABCalls"]';
  const CALL_FWD_BUSY_EXT_SELECT = '.csSelect-container[name="forwardExternalNABCalls"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const COMBO_INPUT = '.combo-input';

  beforeEach(function() {
    this.initModules(callForwardModule);
    this.injectDependencies(
      '$scope'
    );
    this.$scope.voicemailEnabled = true;
    this.$scope.callForwardAll = new CallForwardAll();
    this.$scope.callForwardBusy = new CallForwardBusy();
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucCallForward', {
      callForwardAll: 'callForwardAll',
      callForwardBusy: 'callForwardBusy',
      voicemailEnabled: 'voicemailEnabled',
      onChangeFn: 'onChangeFn(callForwardAll, callForwardBusy)',
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
      expect(this.view).not.toContainElement(CALL_FWD_ALL_SELECT);
      expect(this.view).not.toContainElement(CALL_FWD_BUSY_SELECT);
      expect(this.view).not.toContainElement(CALL_FWD_BUSY_EXT_SELECT);
    });
  })

  describe('Call Forward All with voicemailEnabled = true', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_ALL_RADIO).click().click();
    });

    it('should show combo box when callForwardAll radio is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).not.toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_ALL_SELECT);
    });

    it('should have `Voicemail` option in call forward all select list', function() {
      expect(this.view).toContainElement(CALL_FWD_ALL_SELECT);
      expect(this.view.find(CALL_FWD_ALL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Voicemail');
    });

    it('should invoke `onChangeFn` when Voicemail option is selected', function() {
      let callForwardAll = new CallForwardAll();
      callForwardAll.voicemailEnabled = true;

      this.view.find(CALL_FWD_ALL_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        callForwardAll,
        this.$scope.callForwardBusy
      );
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });

  describe('Call Forward Busy with voicemailEnabled = true', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should show combo box when callForwardBusy radio is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_BUSY_SELECT);
    });

    it('should have `Voicemail` option in call forward busy select list', function() {
      expect(this.view).toContainElement(CALL_FWD_BUSY_SELECT);
      expect(this.view.find(CALL_FWD_BUSY_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Voicemail');
    });

    it('should invoke `onChangeFn` when Voicemail option is selected', function() {
      let callForwardBusy = new CallForwardBusy();
      callForwardBusy.intVoiceMailEnabled = true;

      this.view.find(CALL_FWD_BUSY_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.callForwardAll,
        callForwardBusy
      );
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });

  describe('Call Forward Busy External with voicemailEnabled = true', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.view.find(CALL_FWD_BUSY_RADIO).click().click();
    });

    it('should show combo box when `forward external calls differently` checkbox is checked', function() {
      expect(this.view.find(CALL_FWD_NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_ALL_RADIO)).not.toBeChecked();
      expect(this.view.find(CALL_FWD_BUSY_RADIO)).toBeChecked();
      expect(this.view).toContainElement(CALL_FWD_BUSY_SELECT);
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      expect(this.view).toContainElement(CALL_FWD_BUSY_EXT_SELECT);
    });

    it('should have `Voicemail` option in call forward busy external select list', function() {
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      expect(this.view).toContainElement(CALL_FWD_BUSY_EXT_SELECT);
      expect(this.view.find(CALL_FWD_BUSY_EXT_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Voicemail');
    });

    it('should invoke `onChangeFn` when Voicemail option is selected', function() {
      let callForwardBusy = new CallForwardBusy();
      callForwardBusy.voicemailEnabled = true;

      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      this.view.find(CALL_FWD_BUSY_EXT_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.callForwardAll,
        callForwardBusy
      );
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
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

    it('should not have `Voicemail` option in call forward all select list', function() {
      expect(this.view).toContainElement(CALL_FWD_ALL_SELECT);
      expect(this.view.find(CALL_FWD_ALL_SELECT).find(DROPDOWN_OPTIONS)).toHaveLength(0);
    });

    it('should invoke `onChangeFn` when value is typed in call forward all combo box', function() {
      let callForwardAll = new CallForwardAll();
      callForwardAll.destination = '9725551212';

      this.view.find(CALL_FWD_ALL_SELECT).find(COMBO_INPUT).val('9725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        callForwardAll,
        this.$scope.callForwardBusy
      );
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

    it('should not have `Voicemail` option in call forward busy select list', function() {
      expect(this.view).toContainElement(CALL_FWD_BUSY_SELECT);
      expect(this.view.find(CALL_FWD_BUSY_SELECT).find(DROPDOWN_OPTIONS)).toHaveLength(0);
    });

    it('should not have `Voicemail` option in call forward busy external select list', function() {
      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      expect(this.view).toContainElement(CALL_FWD_BUSY_EXT_SELECT);
      expect(this.view.find(CALL_FWD_BUSY_EXT_SELECT).find(DROPDOWN_OPTIONS)).toHaveLength(0);
    });

    it('should invoke `onChangeFn` when value is typed in call forward busy combo box', function() {
      let callForwardBusy = new CallForwardBusy();
      callForwardBusy.intDestination = '9725551212';

      this.view.find(CALL_FWD_BUSY_SELECT).find(COMBO_INPUT).val('9725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.callForwardAll,
        callForwardBusy
      );
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });

    it('should invoke `onChangeFn` when value is typed in call forward busy external combo box', function() {
      let callForwardBusy = new CallForwardBusy();
      callForwardBusy.destination = '9725551212';

      this.view.find(CALL_FWD_BUSY_EXT_CHECK).click();
      this.view.find(CALL_FWD_BUSY_EXT_SELECT).find(COMBO_INPUT).val('9725551212').change().blur();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.callForwardAll,
        callForwardBusy
      );
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });

});