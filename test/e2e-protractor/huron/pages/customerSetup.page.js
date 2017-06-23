export class CustomerSetupPage {
  constructor() {
    this.customerInformation = {
      title: element(by.cssContainingText('.section__info', 'Customer Information')),
    };
    this.trialServices = {
      title: element(by.cssContainingText('.section__info', 'Trial Services')),
      checkbox: {
        meetingTrial: element(by.css('label[for="meetingTrial"]')),
      },
    };
    this.licensesQuantity = {
      title: element(by.cssContainingText('.section__info', 'Licenses Quantity')),
    };
    this.trialDuration = {
      title: element(by.cssContainingText('.section__info', 'Trial Duration')),
    };
    this.regionalSettings = {
      title: element(by.cssContainingText('.section__info', 'Regional Settings')),
      dropdown: {
        country: element(by.css('.csSelect-container[name="\'defaultCountry\'"]')),
      },
    };
    this.nonTrialServices = {
      title: element(by.cssContainingText('.section__info', 'Non Trial Services')),
    };
  }
};
