export class HuntGroupEdit {
  constructor() {
    this.huntGroupNumInput = element.all(by.css('input.cs-input.small-12')).get(1);
    this.removeExtCard = element.all(by.css('.icon.icon-exit')).first();
    this.removeExtCard3 = element.all(by.css('.icon.icon-exit')).get(2);
    this.fallbackRadio = element(by.id('input[name="fallbackRadio"]'));
    this.extDropdown = element.all(by.css('ul.dropdown-menu')).get(1);
    this.altExtDropdown = element.all(by.css('ul.dropdown-menu')).get(2);
    this.alternateFallbackRadio = element(by.css('label.cs-radio[for="alternate"]'));
    this.numberFormatDropdown = element(by.id('selectMain'));
    this.alternateFallbackInput = element(by.id('internalNumberInput'));
    this.alternateFallbackDid = element(by.css('input[name="phoneinput"]'));
    this.hgSendToApp = element(by.css('label[name="sendToApp"]'));
    this.selectLongestIdle = element(by.css('.icon-circle-clock-hands'));
    this.automaticFallbackRadio = element(by.css('label.cs-radio[for="automatic"]'));
    this.selectBroadcast = element(by.css('.icon-circle-arrows-cross'));
    this.maxRingSecDropdown = element(by.css('.csSelect-container[name="maxRingSecs"]'));
    this.maxRingSecSelect = element(by.css('a[title="15"]'));
    this.maxRingMinDropdown = element(by.css('.csSelect-container[name="maxWaitMins"]'));
    this.maxRingMinSelect = element(by.css('a[title="3"]'));
  }
};
