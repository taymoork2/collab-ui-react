'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Pagination', ['Log', 'UserListService',
    function Pagination(Log, UserListService) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var pagination = {};

      pagination.init = function(scope, perPage) {
        perPage = perPage === undefined ? 10 : perPage;

        var paginator = {
          numPages: 1,
          perPage: perPage,
          page: 0,
          scope: scope
        };

        var listUsers = function(startIndex, sortBy, sortOrder) {

          UserListService.listUsers(startIndex, paginator.perPage, sortBy, sortOrder, function(data, status) {
            if (data.success) {
              Log.debug(data.Resources);
              paginator.scope.totalResults = data.totalResults;
              paginator.scope.queryuserslist = data.Resources;
            } else {
              Log.debug('Query existing users failed. Status: ' + status);
            }
          });
        };

        paginator.prevPage = function() {
          if (paginator.page > 0) {
            paginator.page -= 1;
            listUsers(paginator.page * paginator.perPage + 1, paginator.scope.sort.by, paginator.scope.sort.order);
          }
        };

        paginator.nextPage = function() {
          if (paginator.page < paginator.numPages - 1) {
            paginator.page += 1;
            listUsers(paginator.page * paginator.perPage + 1, paginator.scope.sort.by, paginator.scope.sort.order);
          }
        };

        paginator.firstPage = function() {
          if (paginator.page > 0) {
            paginator.page = 0;
            listUsers(1, paginator.scope.sort.by, paginator.scope.sort.order);
          }
        };

        paginator.lastPage = function() {
          if (paginator.page < paginator.numPages - 1) {
            paginator.page = paginator.numPages - 1;
            listUsers(paginator.page * paginator.perPage + 1, paginator.scope.sort.by, paginator.scope.sort.order);
          }
        };

        return paginator;
      };

      return pagination;
    }
  ]);
