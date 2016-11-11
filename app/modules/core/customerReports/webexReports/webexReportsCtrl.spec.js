describe('Controller: Customer Reports Ctrl', function () {
  var controller, WebexReportService, WebExApiGatewayService, Userservice;

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller',
                            '$scope',
                            '$q',
                            'Authinfo');
    WebexReportService = {
      initReportsObject: function () {}
    };

    WebExApiGatewayService = {
      siteFunctions: function (url) {
        var defer = this.$q.defer();
        defer.resolve({
          siteUrl: url
        });
        return defer.promise;
      }
    };

    Userservice = {
      getUser: function (user) {
        expect(user).toBe('me');
      }
    };

    controller = this.$controller('WebexReportsCtrl', {
      $q: this.$q,
      WebexReportService: WebexReportService,
      WebExApiGatewayService: WebExApiGatewayService,
      Userservice: Userservice,
    });

    this.$scope.$apply();
  });

  it('should not have anything in the dropdown for webex reports', function () {
    expect(controller.webexOptions.length).toBe(0);
  });
});
