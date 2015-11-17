'use strict';

describe(
  'Controller: ReportsCtrl',
  function () {

    // load the controller's module
    beforeEach(module('Squared'));
    beforeEach(module('Huron'));

    var controller, $scope, $q, ReportsService, Log, Config, $translate, CannedDataService, WebexReportService, WebExUtilsFact, Authinfo;

    describe(
      'Expected Responses',
      function () {
        beforeEach(inject(
          function (
            $rootScope,
            $controller,
            _$stateParams_,
            _$q_,
            _Log_,
            _Config_,
            _$translate_,
            _Userservice_,
            _CannedDataService_
          ) {

            $scope = $rootScope.$new();
            $q = _$q_;
            $translate = _$translate_;
            Log = _Log_;
            Config = _Config_;
            CannedDataService = _CannedDataService_;

            var WebexReportService = {
              initReportsObject: function (input) {}
            };

            var WebExUtilsFact = {
              isSiteSupportsIframe: function (url) {
                var defer = $q.defer();
                defer.resolve({
                  siteUrl: url
                });
                return defer.promise;
              }
            };

            var ReportsService = {
              getPartnerMetrics: function (backendCache) {
                return null;
              },
              getAllMetrics: function (backendCache) {
                return null;
              }
            };

            var Authinfo = {
              getPrimaryEmail: function () {
                return "some@email.com";
              },

              getConferenceServicesWithoutSiteUrl: function () {
                return [{
                  license: {
                    siteUrl: 'fakesite1'
                  }
                }, {
                  license: {
                    siteUrl: 'fakesite2'
                  }
                }, {
                  license: {
                    siteUrl: 'fakesite3'
                  }
                }];
              },

              getOrgId: function () {
                return '1';
              },
              isPartner: function () {
                return false;
              }
            };

            controller = $controller('ReportsCtrl', {
              $scope: $scope,
              $translate: $translate,
              $q: $q,
              ReportsService: ReportsService,
              WebexReportService: WebexReportService,
              Log: Log,
              Authinfo: Authinfo,
              Config: Config,
              CannedDataService: CannedDataService,
              WebExUtilsFact: WebExUtilsFact
            });
            $scope.$apply();
          }
        ));

        it('should show engagement as well as webex reports as true', function () {
          expect($scope.showEngagement).toEqual(true);
          expect($scope.showWebexReports).toEqual(false);
        });

        it('should not have anything in the dropdown for webex reports', function () {
          expect($scope.webexOptions.length).toBe(0);
        });
      }
    );
  }
);
