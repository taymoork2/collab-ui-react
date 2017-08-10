export class CustomerSetupPage {
  constructor() {
    this.customerInformation = {
      title: element(by.cssContainingText('.section__info', 'Customer Information')),
    };
    this.trialServices = {
      title: element(by.cssContainingText('.section__info', 'Trial Services')),
      checkbox: {
        meetingTrial: element(by.css('label[for="meetingTrial"]')),
        call: element(by.id('callTrial')),
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
    this.skipButton = element(by.css('.skip-btn'));
    this.launchCustomerPortalButton = element(by.cssContainingText('.btn.btn--primary', 'Yes'));
    this.pstnProvider = element.all(by.css('.pstn-provider-card')).first();
    this.pstnContactInformation = {
      title: element(by.cssContainingText('.section__info', 'PSTN Contract Information')),
    };
    this.phoneNumbers = {
      title: element.all(by.cssContainingText('.section__info> h4', 'Phone Numbers')).last(),
    };
    this.trialFinish = {
      title: element(by.cssContainingText('.splash-msg__title', 'Your trial is ready')),
      description: element(by.cssContainingText('.splash-msg__description', 'Do you want to set up the services for the customer?')),
    };
    this.wizPlanReview = {
      call: {
        colHeader: element(by.cssContainingText('.column-header', 'Call')),
      },
    };
    this.wizCallSetting = {
      companyVoiceMail: {
        lable: element(by.cssContainingText('.control-label', 'Company Voicemail')),
        toggle: element(by.css('[for="companyVoicemailToggle"]')),
      },
    };
    this.wizEnterpriseSetting = {
      subDomainInput: element(by.id('sipDomainInput')),
      checkAvailabilityBtn: element(by.css('.btn.btn--cta')),
    };
    this.wizFinish = {
      message: element.all(by.css('.finish-page>.ng-scope')).first(),
    };
    this.services = {
      title: element(by.css('.page-header__title')),
      serviceList: element(by.css('.services-list')),
      call: {
        callSettingsLink: element(by.cssContainingText('.btn-link', 'Settings')),
      },
    };
  }
};
