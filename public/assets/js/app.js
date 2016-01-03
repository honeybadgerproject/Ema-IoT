emaApp = angular.module('emaApp', ['ngRoute', 'googlechart']);

emaApp.config(function($routeProvider) {
	$routeProvider
		.when('/dashboard', {
			'controller': 'DashboardController',
			'templateUrl': '/views/dashboard.html'
		})
		.otherwise({redirectTo: '/dashboard'});
});

emaApp.constant("chartConfig", {
			"cols": [{
                id: "time",
                label: "Time",
                type: "datetime"
            }, {
                id: "laptop-id",
                label: "Laptop",
                type: "number"
            }, {
                id: "desktop-id",
                label: "Desktop",
                type: "number"
            }, {
                id: "server-id",
                label: "Server",
                type: "number"
            }, {
                id: "cost-id",
                label: "Shipping",
                type: "number"
            }],
            "options": {
	            "title": "Signos vitales",
	            "colors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
	            "defaultColors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
	            "isStacked": "true",
	            "fill": 20,
	            "displayExactValues": true,
	            "vAxis": {
	                "title": "Unit",
	                "gridlines": {
	                    "count": 10
	                }
	            },
	            "hAxis": {
	                "title": "Time",
					"gridlines": {
			            "count": -1,
			            "units": {
			              "minutes": {"format": ['HH:mm', 'HH:mm']}
			            }
			          },
			          "minorGridlines": {
			          	"count": -1,
			            "units": {
			              "seconds": {"format": ['HH:mm:ss', 'HH:mm:ss']}
			            }
			          }
	            },
	            "legend": { "position": 'none' }
        	}
		});


emaApp.service('ChartService', function() {
	this.defineViewWindow = function (startDate, windowRange) {
		if(windowRange == null)
			windowRange = 150000;

		var part = windowRange/4;

		return {
			min: new Date(startDate.getTime() - (part * 3)),
			max: new Date(startDate.getTime() + (part)),
			range: windowRange
		};
	};


	this.transform = function(stream, hash, position) {
		if(hash == null)
			hash = {};

		for(i in stream) {
			// console.log('transform' + stream[i].datetime);
			this.addToHash(stream[i], hash, position);
		}

		return hash;
	};

	this.addToHash = function(streamItem, streamHash, position) {
		var time = this.normalizeDatetime(streamItem.datetime.getTime());


		if(streamHash[time] == null) {
			// console.log('adding hash!' + streamItem.datetime);
			var prev = streamHash[time - 1000];

			if(prev != undefined)
				streamHash[time] = [{ v: streamItem.datetime }, prev[1], prev[2], prev[3]];
			else
				streamHash[time] = [{ v: streamItem.datetime }, {v: 0}, {v: 0}, {v: 0}];
		}

		streamHash[time][position] = { v: streamItem.value};
		 //console.log( streamItem.value);

	};

	this.retriveRows = function(streamHash) {
		var rows = [];
		for(i in streamHash) {
			rows.push({ c: streamHash[i] });
		}
		return rows;
	};

	this.normalizeDatetime = function(datetime) {
		return datetime - (datetime % 1000);
	};

});

emaApp.service('API', [ function() {
	this.demo =  {
		// datetime: new Date(),
		config: {
			temperature: { min: 36, max: 42 },
			bloodPressure: { min: 12, max: 25 },
			pulse: { min: 25, max: 30 }
		},
		streamsData: {
			temperature: [],
			bloodPressure: [],
			pulse: []
		},
		streams: [
			{ id: 1, name: 'temperature', datetime: new Date() },
			{ id: 2, name: 'bloodPressure' , datetime: new Date() },
			{ id: 3, name: 'pulse' , datetime: new Date() }
		]
	};

	this.generateValue = function(min, max, datetime) {
		return {
			datetime: datetime,
			value: Math.random() * (max - min) + min
		};
	};

	this.readStream = function(id, maxItems) {

		for(i in this.demo.streams) {
			if(this.demo.streams[i].id == id) {

				this.demo.streams[i].datetime = new Date(this.demo.streams[i].datetime.getTime() + 1000);
				var streamName = this.demo.streams[i].name;
				var min = this.demo.config[streamName].min;
				var max = this.demo.config[streamName].max;
				var item = this.generateValue(min, max, this.demo.streams[i].datetime);

				if(this.demo.streamsData[streamName].length >= maxItems)
					this.demo.streamsData[streamName].shift();

				this.demo.streamsData[streamName].push(item);

				return this.demo.streamsData[streamName];
			}
		}
	}

}]);

emaApp.controller('DashboardController', [ '$scope', '$interval', 'ChartService', 'API', 'chartConfig', '$http', function($scope, $interval, ChartService, API, chartConfig, $http) {
	$scope.datetime = new Date();
	$scope.streams = [];
	$scope.streamsData = {};


	$http.get('/api/streams').then(function(res) {
		$scope.streams = res.data.streams;
		var selected = true;
		for(stream in $scope.streams) {
			$scope.streamsData[$scope.streams[stream].name] = { arr: [], selected: false};
			selected = false;
		}
	});

	$scope.selectStream = function(stream) {
		for(streamData in $scope.streamsData) {
			$scope.streamsData[streamData].selected = false;
		}
		$scope.streamsData[stream.name].selected = true;
		// console.log($scope.streamsData);
	};

	$scope.streamHash = null;
	for(stream in $scope.streams) {
		$scope.streamHash = ChartService.transform($scope.streamsData[$scope.streams[stream].name].arr, $scope.streamHash);
	}

	//----------  Simulation ---------------------------------------------------------------

	$interval(function() {

		for(stream in $scope.streams) {
			$http.get('/api/stream/' + $scope.streams[stream].name).then(function(res) {
				var values = res.data.values;
				var streamName = res.data.name;

				$scope.streamsData[streamName].arr = [];
				for(i in values) {
					$scope.streamsData[streamName].arr.push(
						{
							datetime: new Date(Date.parse(values[i].timestamp)),
							value:  values[i].value
						}
					);
				}
				// console.log($scope.streamsData[streamName].arr);

				if($scope.streamsData[streamName].selected == true && $scope.streamsData[streamName].arr.length - 1 >= 0)
					//$scope.datetime = $scope.streamsData[streamName].arr[$scope.streamsData[streamName].arr.length - 1].datetime;
				$scope.datetime = $scope.streamsData[streamName].arr[0].datetime;

				$scope.chartObject.options.hAxis.viewWindow = ChartService.defineViewWindow($scope.datetime);

				// $scope.streamHash = ChartService.transform($scope.streamsData[streamName].selected ? $scope.streamsData[streamName].arr: [], $scope.streamHash);

				// $scope.chartObject.data.rows = ChartService.retriveRows($scope.streamHash);
			});
		}

		// console.log($scope.streamsData);

		// for(streamData in $scope.streamsData) {
		// 	if($scope.streamsData[streamData].selected == true && $scope.streamsData[streamData].arr.length - 1 >= 0)
		// 		$scope.datetime = $scope.streamsData[streamData].arr[$scope.streamsData[streamData].arr.length - 1].datetime;

		// 	console.log($scope.datetime);
		// }

		// $scope.chartObject.options.hAxis.viewWindow = ChartService.defineViewWindow($scope.datetime);

		$scope.streamHash = null;
		var i =1;
		for(stream in $scope.streams) {
			$scope.streamHash = ChartService.transform($scope.streamsData[$scope.streams[stream].name].selected ? $scope.streamsData[$scope.streams[stream].name].arr: [], $scope.streamHash, i++);
		}

		// $scope.streamHash = ChartService.transform($scope.streamsData.temperature.selected ? $scope.streamsData.temperature.arr : [], $scope.streamHash, 1);
		// $scope.streamHash = ChartService.transform($scope.streamsData.bloodPressure.selected ? $scope.streamsData.bloodPressure.arr : [], $scope.streamHash, 2);
		// $scope.streamHash = ChartService.transform($scope.streamsData.pulse.selected ? $scope.streamsData.pulse.arr : [], $scope.streamHash, 3);

		$scope.chartObject.data.rows = ChartService.retriveRows($scope.streamHash);
	}, 1000);

	//-----------------------------------------------------------------------------------------


	$scope.chartObject = {};

	init();

	function init() {
        $scope.chartObject.type = "LineChart";
        $scope.chartObject.displayed = false;
        $scope.chartObject.data = {
            "cols": chartConfig.cols,
            "rows": ChartService.retriveRows($scope.streamHash)
        };

        $scope.chartObject.options = chartConfig.options;
        $scope.chartObject.options.viewWindow =  ChartService.defineViewWindow($scope.datetime);

        $scope.chartObject.view = {
            columns: [0, 1, 2, 3, 4]
        };
    };

}]);
