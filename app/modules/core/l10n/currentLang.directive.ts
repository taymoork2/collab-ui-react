/**
  inject 'lang' attribute with the current $translate language setting
  usage:
    <html current-language>
      ...
    </html>
*/

export class CurrentLanguageDirective implements ng.IDirective {
  constructor(
    private $rootScope: ng.IRootElementService,
    private $translate: ng.translate.ITranslateService,
  ) {
  }

  public restrict = 'A';
  public link: ng.IDirectiveLinkFn = (
    _$scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
  ) => {

    const translateLanguage = () => {
      // return the current $translate language, or default
      const tl = this.$translate.use();
      const lang = (_.isEmpty(tl) ? this.$translate.fallbackLanguage() : tl);
      return _.kebabCase(lang);
    };

    const newLang = translateLanguage();
    $element.attr('lang', newLang);

    this.$rootScope.$on('$translateChangeSuccess', (_event, translationResp) => {
      // update lang attribute whenever language changes
      const newLang = _.kebabCase(translationResp.language) || translateLanguage();
      $element.attr('lang', newLang);
    });

  }

  /* @ngInject */
  public static factory($rootScope, $translate) {
    return new CurrentLanguageDirective($rootScope, $translate);
  }
}
