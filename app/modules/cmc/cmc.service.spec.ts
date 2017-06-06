import cmcModule from './index';

describe('CmcService', () => {

  beforeEach(function () {
    this.initModules(cmcModule);
    this.injectDependencies(
      'CmcService',
      '$scope',
      'Orgservice',
    );
  });

  it('should have CmcService resources available', function () {
    expect(this.CmcService.getUserData).toBeTruthy();
  });

  it('should determine whether cmc settings are allowed for this org', function (done) {
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });
    spyOn(this.CmcService, 'hasCmcService').and.returnValue(true);
    let orgId = '1234';
    this.CmcService.allowCmcSettings(orgId).then(function (result) {
      expect(result).toBe(true);
      done();
    });
    this.$scope.$apply();
  });

});
