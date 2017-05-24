import testModule from './index';

describe('currentLanguage Directive', () => {

  beforeEach( function() {
    this.initModules(testModule);
    this.injectDependencies('$translate');

    this.compileTemplate('<div current-language></div>');
  });

  it('should change lang when $translation language changes', function(done) {
    expect(this.view.attr('lang')).toEqual(_.kebabCase(this.$translate.fallbackLanguage()));

    this.$translate.use('fr_CA').then((_data) => {
      expect(this.view.attr('lang')).toEqual('fr-ca');
      done();
    });
    this.$scope.$apply();

  });

});
