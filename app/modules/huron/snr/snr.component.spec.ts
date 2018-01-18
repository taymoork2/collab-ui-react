import snrModule from './index';
describe('component: snr', () => {
  const TOGGLE_SNR = '#enableSnr';
  const DROPDOWN_LIST = 'button[cs-dropdown-toggle]';
  const DROPDOWN_LIST_ADD = '.actions-services li:nth-child(1) a';

  const INPUT_NUMBER = 'input[name="phoneinput"]';
  const SAVE_BUTTON = '.button-container .btn--primary';
  const INPUT_WAITTIME = 'select[name="snrWaitSeconds"]';

  beforeEach(function() {
    this.initModules(snrModule);
    this.injectDependencies('$scope', 'SnrService', '$q', 'HuronCustomerService');
    this.snrInfo = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');
    this.save = jasmine.createSpy('save');
  });

  function initComponent() {
    spyOn(this.SnrService, 'getSnrList').and.returnValue(this.$q.resolve({data: this.snrInfo,
    }));
    spyOn(this.SnrService, 'saveSnr').and.returnValue(this.$q.resolve());

    spyOn(this.HuronCustomerService, 'getVoiceCustomer').and.returnValue(this.$q.resolve({ uuid: '123', regionCode: '214', dialPlanDetails: { countryCode: '+1' } }));

    this.compileComponent('ucSnr', {
      ownerId: '12345',
    });
  }

  describe('Snr init state, SNR disabled', () => {
    beforeEach(initComponent);

    it('should have snr toggle for SNR disabled', function () {
      expect(this.view).toContainElement(TOGGLE_SNR);
      expect(this.view.find(TOGGLE_SNR)).not.toBeChecked();
    });

    it('should have snr Wait time and phone number elements for snr enabled', function () {
      this.view.find(TOGGLE_SNR).click();
      expect(this.view).toContainElement(INPUT_WAITTIME);
      expect(this.view).toContainElement(INPUT_NUMBER);
      expect(this.view.find(TOGGLE_SNR)).toBeChecked();
    });

    it('should have saved with SNR enabled', function () {
      this.view.find(TOGGLE_SNR).click();
      expect(this.view).toContainElement(INPUT_WAITTIME);
      expect(this.view.find(TOGGLE_SNR)).toBeChecked();
      this.view.find(DROPDOWN_LIST).click();
      this.view.find(DROPDOWN_LIST_ADD).click();
      this.view.find(INPUT_NUMBER).val('+1 717-737-7488').change();
      expect(this.view).toContainElement(SAVE_BUTTON);
      this.view.find(SAVE_BUTTON).click();
      expect(this.SnrService.saveSnr).toHaveBeenCalled();
    });

    it('should have saved for SNR disabled', function () {
      this.snrInfo.enableMobileConnect = false;
      expect(this.view.find(TOGGLE_SNR)).not.toBeChecked();
      this.view.find(TOGGLE_SNR).click();
      this.view.find(DROPDOWN_LIST).click();
      this.view.find(DROPDOWN_LIST_ADD).click();
      this.view.find(INPUT_NUMBER).val('+1 717-737-7488').change().blur();
      this.view.find(TOGGLE_SNR).click();
      this.view.find(SAVE_BUTTON).click();
      expect(this.SnrService.saveSnr).toHaveBeenCalled();
      expect(this.view.find(TOGGLE_SNR)).not.toBeChecked();
    });
  });
});
