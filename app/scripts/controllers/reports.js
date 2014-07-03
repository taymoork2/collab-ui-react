'use strict';
/* global AmCharts, $ */

angular.module('wx2AdminWebClientApp')
	.controller('ReportsCtrl', ['$scope', '$parse', 'ReportsService', 'Log', 'Auth',
		function($scope, $parse, ReportsService, Log, Auth) {

			$('#avg-entitlements-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
			$('#avg-calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
			$('#avg-conversations-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
			$('#active-users-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

			$('#avgEntitlementsdiv').addClass('chart-border');
			$('#avgCallsdiv').addClass('chart-border');
			$('#avgConversationsdiv').addClass('chart-border');
			$('#activeUsersdiv').addClass('chart-border');

			$scope.showAvgEntitlementsRefresh = true;
			$scope.showAvgCallsRefresh = true;
			$scope.showAvgConversationsRefresh = true;
			$scope.showActiveUsersRefresh = true;

			var chartVals = [];

			var getMetricData = function(dataList, metric) {
				var count = 0;
				for (var i = 0; i < dataList.length; i++) {
					var val = {};
					if (chartVals[i]) {
						val = chartVals[i];
					}

					val[metric] = dataList[i].count;
					var dateVal = new Date(dataList[i].date);
					dateVal = dateVal.toDateString();
					val.week = dateVal.substring(dateVal.indexOf(' ') + 1);
					chartVals[i] = val;
					count += dataList[i].count;
				}
				return count;
			};

			var getTimeCharts = function(type, intervalCount, intervalType, spanCount, spanType, divName, refreshDivName, refreshVarName, title, color) {
				var params = {
					'intervalCount': intervalCount,
					'intervalType': intervalType,
					'spanCount': spanCount,
					'spanType': spanType
				};
				ReportsService.getUsageMetrics(type, params, function(data, status) {
					var avCount = 0;
					if (data.success) {
						if (data.data.length !== 0) {
							$('#'+divName).removeClass('chart-border');
							var result = data.data;
							if (result.length > 0) {
								avCount = getMetricData(result, type);
							}
							makeTimeChart(chartVals, divName, type, title, color);
							$scope[refreshVarName] = false;

						} else {
							$('#'+refreshDivName).html('<h3>No results available.</h3>');
							Log.debug('No results for '+type+' metrics.');
						}
					} else {
						$('#'+refreshDivName).html('<h3>Error processing request</h3>');
						Log.debug('Query '+type+' metrics failed. Status: ' + status);
					}
				});
			};

			var makeTimeChart = function(sdata, divName, metricName, title, color) {
				var homeChart = AmCharts.makeChart(divName, {
					'type': 'serial',
					'theme': 'chalk',
					'pathToImages': 'http://www.amcharts.com/lib/3/images/',
					'colors':[color],
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
						'title': title
					}],
					'graphs': [{
						'fillAlphas': 0.6,
						'hidden': false,
						'lineAlpha': 0.4,
						'title': title,
						'valueField': metricName
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

			if (Auth.isAuthorized($scope)) {
				getTimeCharts('entitlements', 1, 'month', 1, 'week', 'avgEntitlementsdiv', 'avg-entitlements-refresh', 'showAvgEntitlementsRefresh', 'Entitlements', '#B8DBFF');
				getTimeCharts('avgCalls', 1, 'month', 1, 'week', 'avgCallsdiv', 'avg-calls-refresh', 'showAvgCallsRefresh', 'Calls', '#FFFF99');
				getTimeCharts('avgConversations', 1, 'month', 1, 'week', 'avgConversationsdiv', 'avg-conversations-refresh', 'showAvgConversationsRefresh', 'Conversations', '#C2FFC2');
				getTimeCharts('activeUsers', 1, 'month', 1, 'week', 'activeUsersdiv', 'active-users-refresh', 'showActiveUsersRefresh', 'Active Users', '#FFCCFF');
			}

			$scope.$on('AuthinfoUpdated', function() {
				getTimeCharts('entitlements', 1, 'month', 1, 'week', 'avgEntitlementsdiv', 'avg-entitlements-refresh', 'showAvgEntitlementsRefresh', 'Entitlements', '#B8DBFF');
				getTimeCharts('avgCalls', 1, 'month', 1, 'week', 'avgCallsdiv', 'avg-calls-refresh', 'showAvgCallsRefresh', 'Calls', '#FFFF99');
				getTimeCharts('avgConversations', 1, 'month', 1, 'week', 'avgConversationsdiv', 'avg-conversations-refresh', 'showAvgConversationsRefresh', 'Conversations', '#C2FFC2');
				getTimeCharts('activeUsers', 1, 'month', 1, 'week', 'activeUsersdiv', 'active-users-refresh', 'showActiveUsersRefresh', 'Active Users', '#FFCCFF');
			});
		}
	]);
