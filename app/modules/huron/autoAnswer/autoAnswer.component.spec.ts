import autoAnswerModule from './index';
import { AutoAnswerConst } from './autoAnswer.service';
import { AutoAnswer } from './autoAnswer';

describe('Component: autoAnswer', () => {
  const AUTO_ANSWER_TITLE = '#autoAnswerTitle';
  const AUTO_ANSWER_DESCRIPTION = '#autoAnswerDescription';
  const AUTO_ANSWER_ENABLED_TOGGLE = '#enableAutoAnswer';
  const AUTO_ANSWER_DISABLED_TOGGLE = 'input#enableAutoAnswer[type="checkbox"]:disabled';
  const AUTO_ANSWER_PHONE_SELECT = '#autoAnswerPhoneSelection';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const AUTO_ANSWER_MODE_SPEAKER_RADIO = '#autoAnswerSpeaker';
  const AUTO_ANSWER_MODE_HEADSET_RADIO = '#autoAnswerHeadset';
  const AUTO_ANSWER_PHONE_LABEL = '#autoAnswerDevice';
  const AUTO_ANSWER_MULTI_DEVICE_INFO = '#multi-device-info';
  const AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG = '#sharedline-member-warning';
  const AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING = '#no-supported-device-warning';
  const PHONE_1_TAG = 'pregoldintsl (Cisco 8845 SIP)';
  const PHONE_2_TAG = 'pregoldints2 (Cisco 8845 SIP)';
  const autoAnswer = getJSONFixture('huron/json/autoAnswer/autoAnswer.json');

  beforeEach(function() {
    this.initModules(autoAnswerModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.compileComponent('ucAutoAnswer', {
      autoAnswer: 'autoAnswer',
      onChangeFn: 'onChangeFn(phoneId, enabled, mode)',
    });

  });

  function initComponent() {
    this.$scope.autoAnswer = _.cloneDeep(autoAnswer);
    this.$scope.$apply();
  }

  describe('AutoAnswer enabled for current member', () => {
    beforeEach(initComponent);

    it('should display phone dropdown options, radio button and on toggle based on initial data', function() {
      expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText(PHONE_1_TAG);
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText(PHONE_2_TAG);
      expect(this.controller.autoAnswerPhoneSelected.label).toEqual(PHONE_1_TAG);
      expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
    });

    it('should not display dropdown options, radio buttons when toggle is turned off', function() {
      this.view.find(AUTO_ANSWER_ENABLED_TOGGLE).click();
      expect(this.$scope.onChangeFn.calls.mostRecent().args[0]).toEqual(this.$scope.autoAnswer.phones[0].uuid);
      expect(this.$scope.onChangeFn.calls.mostRecent().args[1]).toBeFalsy();

      expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).not.toBeChecked();
      expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
    });

    it('should invoke onChangeFn when mode is changed', function() {
      this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO).click().trigger('click');
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
          this.$scope.autoAnswer.phones[0].uuid,
          this.$scope.autoAnswer.phones[0].enabled,
          AutoAnswerConst.HEADSET,
      );

      this.$scope.autoAnswer.phones[0].mode = AutoAnswerConst.HEADSET;
      this.$scope.$apply();

      expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText(PHONE_1_TAG);
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText(PHONE_2_TAG);
      expect(this.controller.autoAnswerPhoneSelected.label).toEqual(PHONE_1_TAG);
      expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).not.toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
    });

    it('should invoke onChangeFn when phone option is changed', function() {
      this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
          this.$scope.autoAnswer.phones[1].uuid,
          true,
          AutoAnswerConst.SPEAKERPHONE,
      );

      this.$scope.autoAnswer.phones[0].enabled = false;
      this.$scope.autoAnswer.phones[0].mode = undefined;
      this.$scope.autoAnswer.phones[1].enabled = true;
      this.$scope.autoAnswer.phones[1].mode = AutoAnswerConst.SPEAKERPHONE;
      this.$scope.$apply();

      expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText(PHONE_1_TAG);
      expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText(PHONE_2_TAG);
      expect(this.controller.autoAnswerPhoneSelected.label).toEqual(PHONE_2_TAG);
      expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toBeChecked();
      expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).toExist();
      expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
      expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
    });
  });

  it('should disable toggle and display warning msg when there is no supported phones', function() {
    this.$scope.autoAnswer = new AutoAnswer();
    this.$scope.$apply();

    expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
    expect(this.view.find(AUTO_ANSWER_DISABLED_TOGGLE)).toExist();
    expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
    expect(this.view.find(AUTO_ANSWER_PHONE_SELECT)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).toExist();
  });

  it('should display warning msg that it is enabled for a shared line member when toggle is turned on', function() {
    const autoAnswer1 = _.cloneDeep(autoAnswer);
    autoAnswer1.phones[0].enabled = false;
    autoAnswer1.phones[0].mode = undefined;
    autoAnswer1.enabledForSharedLineMember = true;

    this.$scope.autoAnswer = autoAnswer1;
    this.$scope.$apply();
    expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
    expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
    expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).not.toBeChecked();
    expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();

    this.view.find(AUTO_ANSWER_ENABLED_TOGGLE).click();

    expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).toBeChecked();
    expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText(PHONE_1_TAG);
    expect(this.view.find(AUTO_ANSWER_PHONE_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText(PHONE_2_TAG);
    expect(this.controller.autoAnswerPhoneSelected.label).toEqual(PHONE_1_TAG);
    expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).toBeChecked();
    expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toBeChecked();
    expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).toExist();
    expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).toExist();
    expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
  });

  it('should not display dropdown when there is only one supported phone', function() {
    const autoAnswer2 = _.cloneDeep(autoAnswer);
    autoAnswer2.phones.splice(1, 1);
    this.$scope.autoAnswer = autoAnswer2;
    this.$scope.$apply();

    expect(this.view.find(AUTO_ANSWER_TITLE)).toExist();
    expect(this.view.find(AUTO_ANSWER_ENABLED_TOGGLE)).toBeChecked();
    expect(this.view.find(AUTO_ANSWER_DESCRIPTION)).toExist();
    expect(this.view.find(AUTO_ANSWER_PHONE_SELECT)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_MODE_SPEAKER_RADIO)).toBeChecked();
    expect(this.view.find(AUTO_ANSWER_MODE_HEADSET_RADIO)).not.toBeChecked();
    expect(this.view.find(AUTO_ANSWER_MULTI_DEVICE_INFO)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_PHONE_LABEL)).toHaveText(PHONE_1_TAG);
    expect(this.view.find(AUTO_ANSWER_ENABLED_FOR_SHARED_LINE_MEMBER_WARNING_MSG)).not.toExist();
    expect(this.view.find(AUTO_ANSWER_NO_SUPPORTED_DEVICE_WARNING)).not.toExist();
  });
});
