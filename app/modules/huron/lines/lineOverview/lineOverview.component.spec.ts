import { LineConsumerType, Line } from 'modules/huron/lines/services';
import { CallForward } from 'modules/huron/callForward';

describe('Component: lineOverview', () => {
  const BUTTON_SAVE = '.button-container .btn--primary';
  const BUTTON_CANCEL = '.button-container button:not(.btn--primary)';
  const LINE_LABEL_INPUT = 'input#lineLabel';

  const existingLinePrimary: Line = {
    uuid: '0001',
    internal: '1234',
    external: '+5555551212',
    siteToSite: '71001234',
    incomingCallMaximum: 8,
    primary: true,
    shared: false,
    label: {
      value: 'someuser@some.com',
      appliesToAllSharedLines: false,
    },
  };

  const existingLineNonPrimary: Line = {
    uuid: '0002',
    internal: '6789',
    external: '+5555551313',
    siteToSite: '71006789',
    incomingCallMaximum: 2,
    primary: false,
    shared: false,
    label: {
      value: 'someuser@some.com',
      appliesToAllSharedLines: false,
    },
  };

  const esnPrefix: string = '7100';
  const externalNumbers: string[] = ['+5555551212', '+5555551313'];

  beforeEach(angular.mock.module('Squared'));

  beforeEach(function () {
    this.initModules('huron.line-overview');
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'LineOverviewService',
      'DirectoryNumberOptionsService',
      'CallerIDService',
      'MediaOnHoldService',
      'FeatureToggleService',
      'Notification',
      'LocationsService',
    );

    this.existingLinePrimary = existingLinePrimary;
    this.existingLineNonPrimary = existingLineNonPrimary;
    this.esnPrefix = esnPrefix;
    this.internalNumbers = getJSONFixture('huron/json/internalNumbers/numbersInternalNumbers.json');
    this.externalNumbers = externalNumbers;
    this.lineMediaOptions = getJSONFixture('huron/json/settings/company-moh.json');

    this.$scope.ownerName = 'Bond James Bond';
    this.$scope.ownerId = '007';
    this.getLineOverviewDataDefer = this.$q.defer();
    spyOn(this.LineOverviewService, 'get').and.returnValue(this.getLineOverviewDataDefer.promise);

    this.getInternalNumberOptionsDefer = this.$q.defer();
    spyOn(this.DirectoryNumberOptionsService, 'getInternalNumberOptions').and.returnValue(this.getInternalNumberOptionsDefer.promise);

    this.getEsnPrefixDefer = this.$q.defer();
    spyOn(this.LineOverviewService, 'getEsnPrefix').and.returnValue(this.getEsnPrefixDefer.promise);

    this.getExternalNumberOptionsDefer = this.$q.defer();
    spyOn(this.DirectoryNumberOptionsService, 'getExternalNumberOptions').and.returnValue(this.getExternalNumberOptionsDefer.promise);

    this.saveDefer = this.$q.defer();
    spyOn(this.LineOverviewService, 'save').and.returnValue(this.saveDefer.promise);

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));

    spyOn(this.LocationsService, 'getUserLocation').and.returnValue(this.$q.resolve(true));

    spyOn(this.MediaOnHoldService, 'getLineMohOptions').and.returnValue(this.$q.resolve(this.lineMediaOptions));

    spyOn(this.Notification, 'errorResponse');
  });

  function initComponentWithPlace() {
    this.compileComponent('ucLineOverview', {
      ownerType: 'place',
      ownerName: 'ownerName',
      ownerId: 'ownerId',
      numberId: '0001',
    });
  }

  function initComponentWithUser() {
    this.compileComponent('ucLineOverview', {
      ownerType: 'users',
      ownerName: 'ownerName',
      ownerId: 'ownerId',
      numberId: '0001',
    });
  }

  describe('existing line with primary = true', () => {
    beforeEach(initComponentWithPlace);
    beforeEach(function () {
      this.$scope.numberId = this.existingLinePrimary.uuid;
      this.lineOverview = {
        line: this.existingLinePrimary,
        callForward: new CallForward(),
      };
    });

    it('should initialize all line data', function () {
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.getInternalNumberOptionsDefer.resolve(this.internalNumbers);
      this.getEsnPrefixDefer.resolve(this.esnPrefix);
      this.getExternalNumberOptionsDefer.resolve(this.externalNumbers);
      this.$scope.$apply();

      expect(this.LineOverviewService.get).toHaveBeenCalled();
      expect(this.DirectoryNumberOptionsService.getInternalNumberOptions).toHaveBeenCalled();
      expect(this.LineOverviewService.getEsnPrefix).toHaveBeenCalled();
      expect(this.DirectoryNumberOptionsService.getExternalNumberOptions).toHaveBeenCalled();
      expect(this.MediaOnHoldService.getLineMohOptions).toHaveBeenCalled();
      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
      expect(this.view.find(LINE_LABEL_INPUT).val()).toEqual('someuser@some.com');
    });

    it('should set consumerType to LineConsumerType.PLACES if place is passed in for ownerType', function () {
      expect(this.controller.consumerType).toEqual(LineConsumerType.PLACES);
    });

    it('should NOT show save and cancel buttons immediately', function () {
      expect(this.view.find(BUTTON_SAVE)).not.toExist();
      expect(this.view.find(BUTTON_CANCEL)).not.toExist();
    });

    it('should show save and cancel buttons when form is dirty', function () {
      this.controller.form.$setDirty();
      this.$scope.$apply();
      expect(this.view.find(BUTTON_SAVE)).toExist();
      expect(this.view.find(BUTTON_CANCEL)).toExist();
    });

  });

  describe('new line', () => {
    beforeEach(initComponentWithPlace);
    beforeEach(function () {
      this.lineOverview = {
        line: new Line(),
        callForward: new CallForward(),
      };
      this.lineOverview.sharedLines = [];
      this.getInternalNumberOptionsDefer.resolve(this.internalNumbers);
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.getEsnPrefixDefer.resolve(this.esnPrefix);
      this.getExternalNumberOptionsDefer.resolve(this.externalNumbers);
      this.$scope.$apply();

      spyOn(this.$state, 'go');
    });

    it('should show line label on add a new line', function () {
      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
    });

    it('should grab the first available internal line', function () {
      expect(this.lineOverview.line.internal).toEqual('503');
    });

    it('should show save and cancel buttons immediately', function () {
      expect(this.view.find(BUTTON_SAVE)).toExist();
      expect(this.view.find(BUTTON_CANCEL)).toExist();
    });

    xit('should go back to call overview when cancel is clicked', function () {
      this.view.find(BUTTON_CANCEL).click();
      expect(this.$state.go).toHaveBeenCalled();
    });

    it('should create new line when save button is clicked', function () {
      this.view.find(BUTTON_SAVE).click();
      this.saveDefer.resolve();
      expect(this.LineOverviewService.save).toHaveBeenCalledWith(LineConsumerType.PLACES, '007', undefined, this.lineOverview, []);
    });

  });

  describe('existing line -internal number pool load failure', () => {
    beforeEach(initComponentWithPlace);
    beforeEach(function () {
      this.$scope.numberId = this.existingLinePrimary.uuid;
      this.lineOverview = {
        line: this.existingLinePrimary,
        callForward: new CallForward(),
      };
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.getInternalNumberOptionsDefer.reject('503');
      this.getEsnPrefixDefer.resolve(this.esnPrefix);
      this.getExternalNumberOptionsDefer.resolve(this.externalNumbers);
      this.$scope.$apply();
    });

    it('should initialize assigned number and notify failure for internal number pool', function () {
      expect(this.LineOverviewService.get).toHaveBeenCalled();
      expect(this.MediaOnHoldService.getLineMohOptions).toHaveBeenCalled();
      expect(this.lineOverview.line.internal).toEqual('1234');
      expect(this.DirectoryNumberOptionsService.getInternalNumberOptions).toHaveBeenCalled();
      expect(this.LineOverviewService.getEsnPrefix).toHaveBeenCalled();
      expect(this.DirectoryNumberOptionsService.getExternalNumberOptions).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith('503', 'directoryNumberPanel.internalNumberPoolError');
    });

  });

  describe('Media On Hold Options', () => {
    beforeEach(initComponentWithUser);
    beforeEach(function () {
      this.$scope.numberId = this.existingLinePrimary.uuid;
      this.lineOverview = {
        line: this.existingLinePrimary,
        callForward: new CallForward(),
      };
    });

    it('should call LineMohOptions', function () {
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.$scope.$apply();

      expect(this.LineOverviewService.get).toHaveBeenCalled();
      expect(this.MediaOnHoldService.getLineMohOptions).toHaveBeenCalled();
    });
  });
});
