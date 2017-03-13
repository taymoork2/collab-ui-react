import { LineConsumerType, Line } from 'modules/huron/lines/services';
import { CallForward } from 'modules/huron/callForward';

describe('Component: lineOverview', () => {
  const BUTTON_SAVE = '.button-container .btn--primary';
  const BUTTON_CANCEL = '.button-container button:not(.btn--primary)';

  let existingLinePrimary: Line = {
    uuid: '0000',
    internal: '1234',
    external: '+5555551212',
    siteToSite: '71001234',
    incomingCallMaximum: 8,
    primary: true,
    shared: false,
  };

  let existingLineNonPrimary: Line = {
    uuid: '0001',
    internal: '6789',
    external: '+5555551313',
    siteToSite: '71006789',
    incomingCallMaximum: 2,
    primary: false,
    shared: false,
  };

  let esnPrefix: string = '7100';
  let internalNumbers: Array<string> = ['1234', '5678'];
  let externalNumbers: Array<string> = ['+5555551212', '+5555551313'];

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
      'FeatureToggleService',
    );

    this.existingLinePrimary = existingLinePrimary;
    this.existingLineNonPrimary = existingLineNonPrimary;
    this.esnPrefix = esnPrefix;
    this.internalNumbers = internalNumbers;
    this.externalNumbers = externalNumbers;

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

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.when(true));
  });

  function initComponent() {
    this.compileComponent('ucLineOverview', {
      ownerType: 'place',
      ownerName: 'ownerName',
      ownerId: 'ownerId',
      numberId: 'numberId',
    });
  }

  describe('existing line with primary = true', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.numberId = this.existingLinePrimary.uuid;
      this.lineOverview = {
        line: this.existingLinePrimary,
        callForward: new CallForward(),
      };
    });

    it('should initialize all line data', function () {
      this.getInternalNumberOptionsDefer.resolve(this.internalNumbers);
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.getEsnPrefixDefer.resolve(this.esnPrefix);
      this.getExternalNumberOptionsDefer.resolve(this.externalNumbers);
      this.$scope.$apply();

      expect(this.DirectoryNumberOptionsService.getInternalNumberOptions).toHaveBeenCalled();
      expect(this.LineOverviewService.get).toHaveBeenCalled();
      expect(this.LineOverviewService.getEsnPrefix).toHaveBeenCalled();
      expect(this.DirectoryNumberOptionsService.getExternalNumberOptions).toHaveBeenCalled();
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
    beforeEach(initComponent);
    beforeEach(function () {
      this.lineOverview = {
        line: new Line(),
        callForward: new CallForward(),
      };
      this.getInternalNumberOptionsDefer.resolve(this.internalNumbers);
      this.getLineOverviewDataDefer.resolve(this.lineOverview);
      this.getEsnPrefixDefer.resolve(this.esnPrefix);
      this.getExternalNumberOptionsDefer.resolve(this.externalNumbers);
      this.$scope.$apply();

      spyOn(this.$state, 'go');
    });

    it('should grab the first available internal line', function () {
      expect(this.lineOverview.line.internal).toEqual('1234');
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

});
