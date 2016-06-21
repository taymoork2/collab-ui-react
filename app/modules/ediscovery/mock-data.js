(function () {
  'use strict';

  function EdiscoveryMockData() {
    var alive = false;
    var reports = [];

    var report = {
      "id": "e882dd0e-b86c-4d93-9246-dd6d11ac3452",
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      "createdByUserId": "50df7b9a-b046-4dbb-897b-229d63a524d2",
      "state": "COMPLETED",
      "downloadUrl": "https://avalon-integration.wbx2.com/avalon/api/v1/audit/rooms/396dbfb0-3238-11e6-9f82-c97e9d5e622d/contents?path=https%3A//files-api-integration.wbx2.com/v1/spaces/a72ad34c-c5df-44d2-bcc4-eb30942c6ca6/contents/86095a5b-a7ea-42e9-8dc3-1a248506ccc6/versions/20373cf5c8454d5fa9d51caacbcff2f8/bytes&scr=eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..Kx-zr2tyVLjh7SnU.XaZDtdh7aG8mmXvkbDgbO9nIx_xy7QQNXnS7wxFEnVBNrr__hmfcVzarPfwz7Gp1w2ffIQ0zLj747jk04_KgVrsex4g-OuCSh5YmiJz5XlhAPnBBghZIhproJ3nQsGxwv4EaYBeKLCMUbjR0zC7gh2pWirKI5zynPz3Y4wLpOgPAdMmMWHKl9Hmifb-MztSornagMxgw15yU5mRn9yMIehi7TD4WQiNRdTdDhIjCP7jcX9q23iVjdT0XkuKdhwN32LKErR7wVtbtL0Gytgw_GfoePCf27mc55VDGOeTezD4TdlrvYaL_Kc90kYC8izVnqY8l3k59eppTUyyo8zknRG8lMPmaZMyNgjnRUuDaMTN_3nOekxA6pSEVVpujExkXjRGj_3U9RNRThzT6sPI_IuSWNiGCpRTOOWNNrUtFOshF480iyQAbgUmVYa2wlh5hao9UJFgk0Zv-Iuvio9KPea5IVA.8lflV_AvIO039CHij-mUFA",
      "createdTime": "2016-06-21T06:57:42.926Z",
      "expiryTime": "2016-07-01T06:57:43.636Z",
      "sizeInBytes": 4334,
      "displayName": "Test Avalon Conv",
      "lastUpdatedTime": "2016-06-21T06:57:43.645Z",
      "progress": 100,
      "type": "ROOM_QUERY",
      "roomQuery": {
        "startDate": "2016-06-14T00:00:00.000Z",
        "endDate": "2016-06-14T00:00:00.000Z",
        "roomId": "396dbfb0-3238-11e6-9f82-c97e9d5e622d"
      },
      "runUrl": "https://avalon-integration.wbx2.com/avalon/api/v1/compliance/report/room",
      "url": "https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/e882dd0e-b86c-4d93-9246-dd6d11ac3452",
      "timeoutDetected": false,
      "$$hashKey": "uiGrid-000B"
    };

    //TODO: Paging
    function getReports(from, to) {
      if (!alive) {
        reports = createAllMockReports(10);
        alive = true;
      } else {
        _.each(reports, function (report) {
          report.progress = report.progress + (Math.floor(Math.random() * 10));
          if (report.progress >= 100) {
            report.progress = 100;
            report.state = "COMPLETED";
          }
        });
      }
      return {
        data: {
          reports: reports,
          paging: {
            count: 10,
            limit: 10
          }
        },
        status: 200
      };
    }

    function createAllMockReports(nrOfReports) {
      var reports = [];
      for (var i = 0; i < nrOfReports; i++) {
        report.displayName = "Mock report #" + i;
        report.progress = Math.floor(Math.random() * 101);
        report.roomQuery.startDate = moment().subtract(24, 'hours').format();
        report.roomQuery.endDate = moment().format();
        report.lastUpdatedTime = moment();
        report.state = "RUNNING";
        reports.push(_.cloneDeep(report));
      }
      return reports;
    }

    return {
      getReports: getReports,
    };
  }

  angular.module('Ediscovery').service('EdiscoveryMockData', EdiscoveryMockData);
}());
