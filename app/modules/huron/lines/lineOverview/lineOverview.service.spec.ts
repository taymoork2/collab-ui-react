import { LineOverviewData } from './index';
import { Line, LineConsumerType } from '../services';
import { CallForward } from '../../callForward';

describe('Service: LineOverviewService', () => {
  beforeEach(function () {
    this.initModules('huron.line-overview');
    this.injectDependencies(
      'LineOverviewService',
      'LineService',
      'CallForwardService',
      '$rootScope',
      '$scope',
      '$q'
    );

    this.line = new Line({
      uuid: '0000001',
      primary: true,
      internal: '12345',
      external: null,
      siteToSite: '710012345',
      incomingCallMaximum: 2,
    });

    this.callForward = new CallForward();
    this.lineOverview = new LineOverviewData();
    this.lineOverview.line = this.line;
    this.lineOverview.callForward = this.callForward;

    this.getLineDefer = this.$q.defer();
    spyOn(this.LineService, 'getLine').and.returnValue(this.getLineDefer.promise);

    this.updateLineDefer = this.$q.defer();
    spyOn(this.LineService, 'updateLine').and.returnValue(this.updateLineDefer.promise);

    this.createLineDefer = this.$q.defer();
    spyOn(this.LineOverviewService, 'createLine').and.returnValue(this.createLineDefer.promise);

    this.getCallForwardDefer = this.$q.defer();
    spyOn(this.CallForwardService, 'getCallForward').and.returnValue(this.getCallForwardDefer.promise);

    this.updateCallForwardDefer = this.$q.defer();
    spyOn(this.CallForwardService, 'updateCallForward').and.returnValue(this.updateCallForwardDefer.promise);

    spyOn(this.LineOverviewService, 'cloneLineOverviewData').and.callThrough();
  });

  describe('get exising line', () => {
    beforeEach(function () {
      this.getLineDefer.resolve(this.line);
      this.getCallForwardDefer.resolve(this.callForward);
    });
    it('should call LineService.getLine and CallForward.getCallForward', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001').then( (lineOverview) => {
        expect(lineOverview).toEqual(this.lineOverview);
      });
      this.$rootScope.$digest();
      expect(this.LineService.getLine).toHaveBeenCalled();
      expect(this.CallForwardService.getCallForward).toHaveBeenCalled();
      expect(this.LineOverviewService.cloneLineOverviewData).toHaveBeenCalled();
    });

    it('should return an exact copy of LineOverviewData when getOriginalConfig is called', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      expect(this.LineOverviewService.getOriginalConfig()).toEqual(this.lineOverview);
    });

    it('matchesOriginalConfig should return false when data passed in does not match', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      this.lineOverview.line.external = '+9725551212';
      expect(this.LineOverviewService.matchesOriginalConfig(this.lineOverview)).toBeFalsy();
    });

    it('matchesOriginalConfig should return true when data passed in does match', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      expect(this.LineOverviewService.matchesOriginalConfig(this.lineOverview)).toBeTruthy();
    });
  });

  describe('update exising line', () => {
    beforeEach(function () {
      this.getLineDefer.resolve(_.cloneDeep(this.line));
      this.getCallForwardDefer.resolve(_.cloneDeep(this.callForward));
    });
    it('should only update line when only line is changed', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      this.lineOverview.line.external = '+9725551212';
      this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001',  this.lineOverview);
      expect(this.LineService.updateLine).toHaveBeenCalled();
      expect(this.CallForwardService.updateCallForward).not.toHaveBeenCalled();
    });

    it('should only update callForward when only callForward is changed', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345', '0000001');
      this.$rootScope.$digest();
      this.lineOverview.callForward.callForwardAll.destination = '88888';
      this.LineOverviewService.save(LineConsumerType.PLACES, '12345', '0000001',  this.lineOverview);
      expect(this.LineService.updateLine).not.toHaveBeenCalled();
      expect(this.CallForwardService.updateCallForward).toHaveBeenCalled();
    });
  });

  describe('create new line', () => {
    beforeEach(function () {
      this.newLine = new Line();
      this.getLineDefer.resolve(this.newLine);
      this.getCallForwardDefer.resolve(this.callForward);
      this.createLineDefer.resolve(this.line);
    });

    it('save should call LineOverviewService.createLine for new line', function () {
      this.LineOverviewService.get(LineConsumerType.PLACES, '12345');
      this.$rootScope.$digest();

      let lineOverviewNewLine = new LineOverviewData();
      lineOverviewNewLine.line = this.newLine;
      lineOverviewNewLine.callForward = this.callForward;
      lineOverviewNewLine.line.internal = '12345';
      this.LineOverviewService.save(LineConsumerType.PLACES, '12345', this.newLine.uuid, lineOverviewNewLine);
      this.$rootScope.$digest();

      expect(this.LineOverviewService.createLine).toHaveBeenCalled();
      expect(this.CallForwardService.updateCallForward).toHaveBeenCalled();
    });

  });
});
