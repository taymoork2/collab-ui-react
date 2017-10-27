import evaSetupModule from './evaSetup.component';

describe('Care Expert Virtual Assistant Setup Component', () => {
  const escapeKey = 27;
  const OrgName = 'Test-Org-Name';
  const OrgId = 'Test-Org-Id';
  const pages = [
    {
      name: 'evaOverview',
      previousButtonState: 'hidden',
      nextButtonState: true,
    },
    {
      name: 'vaSummary',
      previousButtonState: true,
      nextButtonState: 'hidden',
    },
  ];
  const expectedPageTemplate = {
    templateId: jasmine.any(String),
    name: jasmine.any(String),
    configuration: {
      mediaType: 'virtualAssistant',
      pages: {
      },
    },
  };
  //fill in expected PageTemplate pages from Pages array above.
  pages.forEach(function (page) { expectedPageTemplate.configuration.pages[page.name] = jasmine.any(Object); });

  const expectedStates = Object.keys(expectedPageTemplate.configuration.pages);

  const getDummyLogo = function (data) {
    return {
      data: data,
    };
  };

  const dummyLogoUrl = 'https://www.example.com/logo.png';

  let getLogoDeferred, getLogoUrlDeferred, controller;

  beforeEach(function () {
    this.initModules('Sunlight', evaSetupModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      '$modal',
      '$timeout',
      'CTService',
      'Analytics',
      'Authinfo',
      'Notification',
      'EvaService',
    );

    //create mock deferred object which will be used to return promises
    getLogoDeferred = this.$q.defer();
    getLogoUrlDeferred = this.$q.defer();

    spyOn(this.$modal, 'open');
    spyOn(this.CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(this.CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(OrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue(OrgName);
    spyOn(Date, 'now').and.returnValues(10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10);


    this.compileComponent('eva-setup', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  function checkStateOfNavigationButtons(pageIndex: number, previousButtonState: any, nextButtonState: any): void {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton()).toEqual(previousButtonState);
    expect(controller.nextButton()).toEqual(nextButtonState);
  }

  describe('should test the', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(controller, 'getText').and.returnValue(deferred.promise);
    });

    it('getTitle', function () {
      controller.getTitle();
      expect(controller.getText).toHaveBeenCalledWith('createTitle');
    });

    it('getTitle with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getTitle();
      expect(controller.getText).toHaveBeenCalledWith('editTitle');
    });

    it('getSummaryDescription', function () {
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.desc');
    });

    it('getSummaryDescription with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.editDesc');
    });
  });

  describe('Page Structures', function () {
    beforeEach(function () {
      getLogoDeferred.resolve(getDummyLogo('abcd'));
      getLogoUrlDeferred.resolve(dummyLogoUrl);
      this.$scope.$apply();
    });

    it('States correlate to pages', function () {
      expect(controller.states).toEqual(expectedStates);
    });

    it('First state is initial state', function () {
      expect(controller.currentState).toEqual(controller.states[0]);
    });

    it('keyboard functionality', function () {
      controller.evalKeyPress(escapeKey);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('Walk pages forward in order ', function () {
      for (let i = 0; i < controller.states.length; i++) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.nextPage();
        expect(this.Analytics.trackEvent).toHaveBeenCalledWith(controller.template.configuration.pages[controller.currentState].eventName, { durationInMillis: 0 });
        this.Analytics.trackEvent.calls.reset();
        this.$timeout.flush();
      }
    });

    it('Walk pages Backward in order ', function () {
      controller.currentState = controller.states[controller.states.length - 1];
      for (let i = (controller.states.length - 1); 0 <= i; i--) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.previousPage();
        this.$timeout.flush();
      }
    });

    pages.forEach(function (expectedPage, index) {
      it(expectedPage.name + ': previous button should be ' + (expectedPage.previousButtonState ? 'Enabled' : 'Disabled') +
        ' and next button should be ' + (expectedPage.nextButtonState ? 'Enabled' : 'Disabled'), function () {
        checkStateOfNavigationButtons(index, expectedPage.previousButtonState, expectedPage.nextButtonState);
      });

      it(expectedPage.name + ': make sure template file exists for page ' + expectedPage.name + '.tpl.html\'', function () {
        const expectedPageFilename = 'modules/sunlight/features/virtualAssistant/wizardPages/' + expectedPage.name + '.tpl.html';
        controller.currentState = controller.states[index];
        expect(controller.getCurrentPage()).toEqual(expectedPageFilename);
      });
    });
  });

  describe('Summary Page', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
    });

    it('When invoke Finish button, the submitFeature function is called', function () {
      spyOn(this.$state, 'go');

      controller.submitFeature();
      this.$scope.$apply();

      expect(this.$state.go).toHaveBeenCalledWith('care.Features');
      expect(controller.creatingTemplate).toEqual(false);
    });
  });
});
