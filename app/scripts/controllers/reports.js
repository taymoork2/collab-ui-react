'use strict';

/* global AmCharts */

angular.module('wx2AdminWebClientApp')
	.controller('ReportsCtrl', [
		function() {

			var data = [{
				'eventName': 'Call-Terminated Success',
				'count': 156
			}, {
				'eventName': 'Calls-Cancelled Failure',
				'count': 212
			}, {
				'eventName': 'Calls-Cancelled Success',
				'count': 42
			}, {
				'eventName': 'Calls-Completed Failure',
				'count': 26
			}, {
				'eventName': 'Calls-Completed Success',
				'count': 133
			}, {
				'eventName': 'Calls-Created Success',
				'count': 202
			}, {
				'eventName': 'Calls-Declined Success',
				'count': 9
			},{
				'eventName': 'Calls-Left Success',
				'count': 270
			}];

			var chart = AmCharts.makeChart('chartdiv', {
				'type': 'pie',
				'theme': 'none',
				'legend': {
					'markerType': 'circle',
					'position': 'right',
					'marginRight': 80,
					'autoMargins': false
				},
				'dataProvider': data,
				'valueField': 'count',
				'titleField': 'eventName',
				'balloonText': '[[title]]<br><span style=\"font-size:14px\"><b>[[value]]</b> ([[percents]]%)</span>',
				'exportConfig': {
					'menuTop': '0px',
					'menuItems': [{
						'icon': '/lib/3/images/export.png',
						'format': 'png'
					}]
				}
			});

			chart.colors = ['#FFCCFF', '#B8DBFF','#FFFF99', '#C2FFC2', '#3399FF', '#FF6666', '#FFB870', '#FF6600', '#FF9E01', '#FCD202', '#F8FF01', '#B0DE09', '#04D215', '#0D8ECF', '#0D52D1', '#2A0CD0', '#8A0CCF', '#CD0D74', '#754DEB', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'];

		}
	]);
