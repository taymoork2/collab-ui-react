angular.module('Mediafusion')

.service('vtslistservice', ['$http', '$rootScope', 'Storage', 'Config', 'Authinfo', 'Utils', 'Auth', 'Config',

  function ($http, $rootScope, Storage, Config, Authinfo, Utils, Auth, Config) {

    var vtslistservice = {

      listVts: function (callback) {
        console.log("Inside vtslistservice function");

        var data = [{
          "id": "69076216-cb66-40b6-972a-655a0cd94b7f",
          "name": "TPS_1",
          "description": "test description",
          "kind": "TPS",
          "host": "99.99.99.88",
          "port": 5060,
          "transport": "TCP",
          "opState": "ENABLED",
          "maxCapacity": 12,
          "username": "admin",
          "password": "test_password",
          "ownerId": "test_owner_id",
          "url": "http://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges/69076216-cb66-40b6-972a-655a0cd94b7f"
        }, {
          "id": "c1c3966b-1226-47d1-ab75-620274f38a21",
          "name": "TPS_2",
          "description": "test description",
          "kind": "TPS",
          "host": "10.99.99.88",
          "port": 5060,
          "transport": "TCP",
          "opState": "ENABLED",
          "maxCapacity": 12,
          "username": "admin",
          "password": "test_password",
          "ownerId": "test_owner_id",
          "url": "http://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges/c1c3966b-1226-47d1-ab75-620274f38a21"
        }, {
          "id": "f044bf4b-74a9-4789-9e80-ff4945d4bd1a",
          "name": "TPS_3",
          "description": "test description",
          "kind": "TPS",
          "host": "10.99.99.82",
          "port": 5060,
          "transport": "TCP",
          "opState": "ENABLED",
          "maxCapacity": 12,
          "username": "admin",
          "password": "test_password",
          "ownerId": "test_owner_id",
          "url": "http://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges/f044bf4b-74a9-4789-9e80-ff4945d4bd1a"
        }, {
          "id": "d441b47c-74bb-49d4-b74c-596811d25f3d",
          "name": "TPS_6",
          "description": "test description",
          "kind": "TPS",
          "host": "10.99.99.86",
          "port": 5060,
          "transport": "TCP",
          "opState": "MAINTENANCE",
          "maxCapacity": 12,
          "username": "admin",
          "password": "test_password",
          "ownerId": "test_owner_id",
          "url": "http://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges/d441b47c-74bb-49d4-b74c-596811d25f3d"
        }, {
          "id": "69c97fac-bf5e-4caf-8ed5-61a33c129012",
          "name": "TPS_8",
          "description": "test description 8",
          "kind": "TPS",
          "host": "10.99.99.88",
          "port": 5060,
          "transport": "TCP",
          "opState": "ENABLED",
          "maxCapacity": 12,
          "username": "admin",
          "password": "test_password",
          "ownerId": "test_owner_id",
          "url": "http://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges/69c97fac-bf5e-4caf-8ed5-61a33c129012"
        }];
        console.log("[Authinfo.getOrgId()] = " + [Authinfo.getOrgId()]);
        callback(data, true);
        /*var attributes = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles';
        var scimUrl = Config.scimUrl + '?' + '&' + attributes;

        //var listUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);
        var listUrl = 'https://10.22.131.183:8080/cmo-rm-provision/api/rest/resources/bridges?ownerId='+[Authinfo.getOrgId()];
        //Utils.sprintf(dmcBaseURL+ 'dmcs/getdmcs', [Authinfo.getOrgId()]);
        console.log("[Authinfo.getOrgId()] = " + [Authinfo.getOrgId()]);
        console.log("listUrl = " + listUrl);
        // $http.defaults.useXDomain = true;
        //delete $http.defaults.headers.common['X-Requested-With']; 
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        $http.get(listUrl)
          .success(function (data, status) {
            data.success = true;
            console.log("inside http success");
            callback(data, status);
          })
          .error(function (data, status) {
            data.success = false;
            data.status = status;
            callback(data, status);
            console.log("inside http error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
            Auth.handleStatus(status, description);
          });*/

      },

      remove: function (entResId, callback) {
        console.log("Inside remove function");
        var data = true;
        callback(data, true);

        /* var listUrl = 'http://10.22.164.19:8080/cmo-rm-provision/api/rest/resources/bridges?ownerId=test_owner_id';
        //Utils.sprintf(dmcBaseURL+ 'dmcs/getdmcs', [Authinfo.getOrgId()]);
        console.log("[Authinfo.getOrgId()] = " + [Authinfo.getOrgId()]);
        console.log("listUrl = " + listUrl);
		// $http.defaults.useXDomain = true;
		 //delete $http.defaults.headers.common['X-Requested-With']; 
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        $http.get(listUrl)
          .success(function (data, status) {
            data.success = true;
            console.log("inside http success");
            callback(data, status);
          })
          .error(function (data, status) {
            data.success = false;
            data.status = status;
            callback(data, status);
            console.log("inside http error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
            Auth.handleStatus(status, description);
          });*/

      },

      changeState: function (entRes, callback) {
        console.log("Inside remove function");
        var data = null;
        callback(data, true);

        /* var listUrl = 'http://10.22.164.19:8080/cmo-rm-provision/api/rest/resources/bridges?ownerId=test_owner_id';
        //Utils.sprintf(dmcBaseURL+ 'dmcs/getdmcs', [Authinfo.getOrgId()]);
        console.log("[Authinfo.getOrgId()] = " + [Authinfo.getOrgId()]);
        console.log("listUrl = " + listUrl);
		// $http.defaults.useXDomain = true;
		 //delete $http.defaults.headers.common['X-Requested-With']; 
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        $http.get(listUrl)
          .success(function (data, status) {
            data.success = true;
            console.log("inside http success");
            callback(data, status);
          })
          .error(function (data, status) {
            data.success = false;
            data.status = status;
            callback(data, status);
            console.log("inside http error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
            Auth.handleStatus(status, description);
          });*/

      }

    };

    return vtslistservice;

  }

]);
