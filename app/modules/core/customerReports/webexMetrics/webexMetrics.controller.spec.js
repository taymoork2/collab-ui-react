'use strict';

//This commit is just for demo needed.
xdescribe('Controller: WebEx Metrics Ctrl', function () {
  var controller, WebExApiGatewayService, Userservice;

  afterEach(function () {
    controller = WebExApiGatewayService = Userservice = undefined;
  });

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller',
      '$scope',
      '$q');

    WebExApiGatewayService = {
      siteFunctions: function (url) {
        var defer = this.$q.defer();
        defer.resolve({
          siteUrl: url,
        });
        return defer.promise;
      },
    };

    Userservice = {
      getUser: function (user) {
        expect(user).toBe('me');
      },
    };

    controller = this.$controller('WebExMetricsCtrl', {
      $q: this.$q,
      WebExApiGatewayService: WebExApiGatewayService,
      Userservice: Userservice,
    });

    this.$scope.$apply();
  });

  it('should not have anything in the dropdown for webex metrics', function () {
    expect(controller.webexOptions.length).toBe(0);
  });

  it('initial state, isIframeLoaded should be false, currentFilter should be CHP Reports', function () {
    expect(controller.isIframeLoaded).toBeFalsy();
    expect(controller.currentFilter.type).toBe('webex');
  });
});

