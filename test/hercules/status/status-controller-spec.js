'use strict';

describe('StatusController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  describe('is enabled', function () {

    var $scope, service, auth, descriptor, fetchDeferral, $rootScope;

    beforeEach(inject(function ($injector, _$controller_, $q, _$rootScope_) {
      $rootScope = _$rootScope_;
      $scope = {
        $watch: sinon.stub()
      };
      fetchDeferral = $q.defer();
      service = {
        fetch: sinon.stub().returns(fetchDeferral.promise)
      };
      auth = {
        isFusion: function () {
          return true;
        }
      };
      descriptor = {
        isFusionEnabled: sinon.stub()
      };
      _$controller_('StatusController', {
        $scope: $scope,
        Authinfo: auth,
        ConnectorService: service,
        ServiceDescriptor: descriptor
      });
      var $httpBackend = $injector.get('$httpBackend');
      $httpBackend
        .when('GET', 'l10n/en_US.json')
        .respond({});
    }));

    function resolveFetch(data) {
      fetchDeferral.resolve(data);
      $rootScope.$apply();
    }

    function failFetch() {
      fetchDeferral.reject();
      $rootScope.$apply();
    }

    it('defaults some scope vars', function () {
      descriptor.isFusionEnabled.callArgWith(0, true);
      expect($scope.isEnabled).toEqual(true);
      expect($scope.color).toEqual('gray');
      expect($scope.className).toEqual('fa fa-gear fa-spin');
    });

    it('fetches on load', function () {
      descriptor.isFusionEnabled.callArgWith(0, true);
      expect(service.fetch.callCount).toEqual(1);
    });

    it('sets appropriate values when xhr fails', function () {
      descriptor.isFusionEnabled.callArgWith(0, true);
      failFetch({});
      expect($scope.color).toEqual('red');
      expect($scope.className).toEqual('fa fa-circle');
    });

    it('sets appropriate values when there are clusters with errors', function () {
      descriptor.isFusionEnabled.callArgWith(0, true);
      resolveFetch([{
        needs_attention: true
      }, {
        needs_attention: true
      }, {
        needs_attention: false
      }]);
      expect($scope.color).toEqual('red');
      expect($scope.className).toEqual('fa fa-circle');
      expect($scope.needs_attention).toEqual(2);
    });

    it('sets appropriate values when there are no clusters with errors', function () {
      descriptor.isFusionEnabled.callArgWith(0, true);
      resolveFetch([{
        needs_attention: false
      }, {
        needs_attention: false
      }, {
        needs_attention: false
      }]);
      expect($scope.color).toEqual('green');
      expect($scope.className).toEqual('fa fa-circle');
      expect($scope.needs_attention).toEqual(0);
    });

  });

  describe('is disabled', function () {

    var $scope, service, auth;

    beforeEach(inject(function (_$controller_) {
      $scope = {
        $watch: sinon.stub()
      };
      service = {
        fetch: sinon.stub()
      };
      auth = {
        isFusion: function () {
          return false;
        }
      };
      _$controller_('StatusController', {
        $scope: $scope,
        ConnectorService: service,
        Authinfo: auth
      });
    }));

    it('defaults some scope vars', function () {
      expect($scope.isEnabled).toEqual(false);
      expect(service.fetch.callCount).toEqual(0);
    });

  });

});
