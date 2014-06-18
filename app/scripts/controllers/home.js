'use strict';
/* global AmCharts */

angular.module('wx2AdminWebClientApp')
.controller('HomeCtrl', ['$scope', 'ReportsService', 'Log', 'Authinfo', 'Auth', 'Storage',
	function($scope, ReportsService, Log, Authinfo, Auth, Storage) {

		$('#au-graph-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#au-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#convo-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#share-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

		$('#activeUsersChart').addClass('chart-border');

		$scope.showAUGraphRefresh = false;
		$scope.showAURefresh = true;
		$scope.showCallsRefresh = true;
		$scope.showConvoRefresh = true;
		$scope.showShareRefresh = true;

		$scope.showAUGraph = true;
		$scope.showAUContent = false;
		$scope.showCallsContent = false;
		$scope.showConvoContent = false;
		$scope.showShareContent = false;

		var chartVals = [];

		var getActiveUsersCount = function()
		{
			var params = {'intervalCount':1, 'intervalType':'month'};
			ReportsService.getUsageMetrics('activeUserCount', params, function(data, status)
			{
				if (data.success) {
					if (data.length !== 0)
					{
						$scope.showAURefresh = false;
						$scope.showAUContent = true;
						$scope.activeUserCount = data.count;
					}
					else
					{
						$('#au-refresh').html('<span>No results available.</span>');
					}
				} else {
					Log.debug('Query active users failed. Status: ' + status);
					$('#au-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getMetricData = function (dataList, metric) {
			var count = 0;
			for (var i = 0; i < dataList.length; i++) {
				var val = {};
				if (chartVals[i])
				{
					val = chartVals[i];
				}
				
				val[metric] = dataList[i].count;
				var dateVal = new Date(dataList[i].date);
				dateVal = dateVal.toDateString();
				val.week = dateVal.substring(dateVal.indexOf(' ')+1);
				chartVals[i] = val;
				count += dataList[i].count;
			}
			return count;
		};

		var getCallMetrics = function()
		{
			var params = {'intervalCount':1, 'intervalType':'month', 'spanCount':1, 'spanType':'week'};
			ReportsService.getUsageMetrics('calls', params, function(data, status)
			{
				$scope.callsCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var calls = data.reportDetail;
						if (calls.length > 0)
						{
							$scope.callsCount = getMetricData(calls, 'calls');
						}
						$scope.showCallsRefresh = false;
						$scope.showCallsContent = true;
					}
					else
					{
						$('#calls-refresh').html('<span>No results available.</span>');
					}
					makeChart(chartVals);
				} else {
					Log.debug('Query calls metrics failed. Status: ' + status);
					$('#calls-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getConversationMetrics = function()
		{
			var params = {'intervalCount':1, 'intervalType':'month', 'spanCount':1, 'spanType':'week'};
			ReportsService.getUsageMetrics('conversations', params, function(data, status)
			{
				$scope.convoCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var convos = data.reportDetail;
						if (convos.length > 0)
						{
							$scope.convoCount = getMetricData(convos, 'convos');
						}
						$scope.showConvoRefresh = false;
						$scope.showConvoContent = true;
					}
					else
					{
						$('#convo-refresh').html('<span>No results available.</span>');
					}
					makeChart(chartVals);
				} else {
					Log.debug('Query conversation metrics failed. Status: ' + status);
					$('#convo-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getContentShareMetrics = function()
		{
			var params = {'intervalCount':1, 'intervalType':'month', 'spanCount':1, 'spanType':'week'};
			ReportsService.getUsageMetrics('contentShareSizes', params, function(data, status)
			{
				$scope.cShareCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var cShares = data.reportDetail;
						if (cShares.length > 0)
						{
							var countVal = getMetricData(cShares, 'share');
							$scope.cShareCount = countVal.toFixed(4);
						}
						$scope.showShareRefresh = false;
						$scope.showShareContent = true;
					}
					else
					{
						$('#share-refresh').html('<span>No results available.</span>');
					}
					makeChart(chartVals);
				} else {
					Log.debug('Query content share metrics failed. Status: ' + status);
					$('#share-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getActiveUsersMetrics = function()
		{
			var params = {'intervalCount':1, 'intervalType':'month', 'spanCount':1, 'spanType':'week'};
			ReportsService.getUsageMetrics('activeUsers', params, function(data, status)
			{
				var auCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var aUsers = data.reportDetail;
						if (aUsers.length > 0)
						{
							auCount = getMetricData(aUsers, 'users');
						}
						makeChart(chartVals);
					}
					else
					{
						Log.debug('No results for active users metrics.');
					}
				} else {
					Log.debug('Query active users metrics failed. Status: ' + status);
				}
			});
		};

		var getHealthMetrics = function()
		{
			ReportsService.healthMonitor(function(data, status)
			{
				if (data.success) {
					$scope.healthMetrics = data.components;
				} else {
					Log.debug('Query active users metrics failed. Status: ' + status);
				}
			});
		};

		if (!Authinfo.isEmpty())
		{
			getActiveUsersCount();
			getCallMetrics();
			getConversationMetrics();
			getContentShareMetrics();
			getActiveUsersMetrics();
			getHealthMetrics();
		}
		else
    {
      var token = Storage.get('accessToken');
      if (token) {
        Log.debug('Authorizing user... Populating admin data...');
        Auth.authorize(token, $scope);
      } else {
        Log.debug('No accessToken.');
      }
    }

		$scope.$on('AuthinfoUpdated', function() {
      getActiveUsersCount();
			getCallMetrics();
			getConversationMetrics();
			getContentShareMetrics();
			getActiveUsersMetrics();
			getHealthMetrics();
    });

		var makeChart = function(sdata) {
			var homeChart = AmCharts.makeChart('activeUsersChart', {
				'type': 'serial',
				'theme': 'chalk',
				'pathToImages': 'http://www.amcharts.com/lib/3/images/',
				'legend': {
					'equalWidths': false,
					'periodValueText': 'total: [[value.sum]]',
					'position': 'top',
					'valueAlign': 'left',
					'valueWidth': 100
				},
				'dataProvider': sdata,
				'valueAxes': [{
					'stackType': 'regular',
					'gridAlpha': 0.07,
					'position': 'left',
					'title': 'Activity'
				}],
				'graphs': [{
					'fillAlphas': 0.6,
					'hidden': false,
					'lineAlpha': 0.4,
					'title': 'Active Users',
					'valueField': 'users'
				}, {
					'fillAlphas': 0.6,
					'lineAlpha': 0.4,
					'hidden': false,
					'title': 'Calls',
					'valueField': 'calls'
				}, {
					'fillAlphas': 0.6,
					'lineAlpha': 0.4,
					'hidden': false,
					'title': 'Conversations',
					'valueField': 'convos'
				}, {
					'fillAlphas': 0.6,
					'lineAlpha': 0.4,
					'hidden': false,
					'title': 'Content Share',
					'valueField': 'share'
				}],
				'plotAreaBorderAlpha': 0,
				'marginTop': 10,
				'marginLeft': 0,
				'marginBottom': 0,
				'chartScrollbar': {},
				'chartCursor': {
					'cursorAlpha': 0
				},
				'categoryField': 'week',
				'categoryAxis': {
					'startOnAxis': true,
					'axisColor': '#DADADA',
					'gridAlpha': 0.07
				}
			});
		};
		
		var chart = makeChart(chartVals);
		

	}
]);

