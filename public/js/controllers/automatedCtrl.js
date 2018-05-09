'use strict';

var autoModule = angular.module("autoFarm.controllers.autoCtrl", ["ui.bootstrap"])
autoModule.controller("autoCtrl", ["$rootScope", "$scope", "$window", "$location", "$http", "$routeParams",
	function($rootScope, $scope, $window, $location, $http, $routeParams){
		// var socket;
		$scope.isLoading = true;

		if($location.url() == '/automated'){
			$http({
				method	: 'GET', 
				url		: '/getLots'
			}).then(function(res){
				console.log(res.data);
				$rootScope.towns = res.data.data;
				$scope.isLoading = false;
			}, function(error){
				console.log(error);
			});
		}else if($location.url().includes('/schedule')){
			$rootScope.event = {
				start 	: "",
				end 	: "",
				lot_id	: $routeParams.lotid
			}
				
			$rootScope.activity = {
				label 		: "",
				template 	: "",
				type 		: "",
				lot_id		: $routeParams.lotid
			};
			$scope.isLoading = false;
		} else {

			
			var data = JSON.parse($window.localStorage.getItem('data'));
			if((data == null) || $rootScope.activity && $rootScope.activity.lot_id != $routeParams.lotid){
				$window.location.href = '/#!/automated';
				// Needs Notif;
				console.log("Lot_id does not match!");
				return;
			} else {
				$rootScope.activity = data.activity;
				$rootScope.event = data.event;
			}

			$http({
				method	: 'GET', 
				url		: '/getLot/' + $routeParams.lotid
			}).then(function(res){

				$rootScope.template = {
					grid 	: 	[[]],
					path 	: 	[]
				}

				$rootScope.towns = res.data.data;
				for(var i = 0; i < $rootScope.towns.length; i++){
					$rootScope.template.grid[i] = [];
					for(var j = 0; j < $rootScope.towns.width; j++){
						$rootScope.template.grid[i][j] = false;
					}
				}
				$rootScope.towns.length = computeRange($rootScope.towns.length);
				$rootScope.towns.width = computeRange($rootScope.towns.width);
				$scope.toggleOption('choose');
				$scope.setActivity();
				$scope.isLoading = false;

			}, function(error){
				console.log(error);
			});

		}

		console.log("Here in autoCtrl");

		$scope.setEvent = function(){
			console.log($rootScope.event);
			var data = {
				event 	: $rootScope.event,
				activity: $rootScope.activity
			}

			$window.localStorage.setItem('data', JSON.stringify(data));
			$window.location.href = "/#!/automated/activity/" + $routeParams.lotid;
		}

		$scope.setActivity = function(){
			$scope.toggleSelectAll(false);
			console.log($rootScope.activity);
			$rootScope.activity.label = "";
			if($rootScope.activity.type != 'plow'){
				var type = "";
				if($rootScope.activity.type == 'seed'){
					type = 'plow';
				} else {
					type = 'seed';
				}

				$scope.templateList = []
				$http({
					method	: 'GET', 
					url		: '/getActivities/' + $routeParams.lotid + '/' + type
				}).then(function(res){
					console.log(res);
					$scope.templateList = res.data.data;
					console.log($scope.templateList);
				}, function(error){
					console.log(error);
				});
			}
		}

		$scope.toggleOption = function(flag){
			$scope.toggleSelectAll(false);
			if(flag == 'choose'){
				// $scope.activityList = []
				if(!$scope.activityList){
					$http({
						method	: 'GET', 
						url		: '/getActivities/' + $routeParams.lotid + '/' + $rootScope.activity.type
					}).then(function(res){
						console.log(res);
						$scope.activityList = [];
						$scope.activityList = res.data.data
					}, function(error){
						console.log(error);
					});
				}
			}
			$scope.option = flag;
		}

		$scope.setTemplate = function(activity, isChosen){
			// console.log(activity);
			if(!activity){
				return;
			}
			if(isChosen){
				$rootScope.activity.id = activity.id;
				$rootScope.activity.label = activity.label
			}
			console.log(activity);
			$rootScope.activity.template = activity.template_id;
			$rootScope.template.path = activity.path;
			$rootScope.template.grid = activity.grid;
			
			$scope.startPoint = activity.path[0];
		}

		$scope.toggleSelectAll = function(flag){
			$scope.hasPath = flag;
			$rootScope.template.path = [];
			for(var i = 0; i < $rootScope.towns.length.length; i++){
				if(i%2 == 0){
					for(var j = 0; j < $rootScope.towns.width.length; j++){
						$rootScope.template.grid[i][j] = flag;
						pathFunction(i, j);
					}
				} else {
					for(var j = $rootScope.towns.width.length - 1; j > -1; j--){
						$rootScope.template.grid[i][j] = flag;
						pathFunction(i, j);
					}
				}
			}
		}

		$scope.checkFunction = function(x, y){
			pathFunction(x, y);
		}

		var pathFunction = function(x, y){
			if($rootScope.template.grid[x][y]){
				$rootScope.template.path = createPath($rootScope.template.path, x, y);
				if($rootScope.template.path.length > 1){
					var direction = getDirection($rootScope.template.path[$rootScope.template.path.length - 2], $rootScope.template.path[$rootScope.template.path.length - 1]);
					if(!direction){
						$scope.hasInvalid = $rootScope.template.path[$rootScope.template.path.length - 1];
						// Needs notif
						$scope.message = "Invalid path!";
					}
				}
			} else { 
				$rootScope.template.path = removePath($rootScope.template.path, x, y);
				if($scope.hasInvalid){
					$scope.hasInvalid = false;
					$scope.message = "";
				}
			}
		}

		var createPath = function(path, x, y){
			path.push({x: x, y: y});
			if(path.length == 1){
				$scope.startPoint = path[0];
			}
			return path;
		}

		var removePath = function(path, x, y){
			var index = _.findIndex(path, function(item){
				return item.x == x && item.y == y;
			});
			var removedPoints = _.slice(path, index, path.length)
			var dropCount =  path.length - index;
			path = _.dropRight(path, dropCount)
			removedPoints.forEach(function(item){
				$rootScope.template.grid[item.x][item.y] = false;
			});
			if(!path.length){
				$scope.startPoint = false;
				return [];
			}
			return path;
		}

		var getDirection = function(from, to){
			if(from.x == (to.x) + 1 && from.y == (to.y)){
				return "South";
			} else if(from.x == (to.x) - 1 && from.y == to.y){
				return "North";
			} else if(from.x == (to.x) && from.y == (to.y) + 1){
				return "East";
			} else if(from.x == (to.x) && from.y == (to.y) - 1){
				return "West";
			}
			return false;
		}

		var computeRange = function(value){
			var array = [];
			for(var i = 0; i < value; i++){
				array.push(i);
			}
			return array;
		}
	}	
]);

autoModule.controller("autoModalCtrl", ["$rootScope", "$scope", "$window", "$http",
	function($rootScope, $scope, $window, $http){
		var $add = this;
		$scope.isLoading = true;
		console.log("Here in autoModalCtrl");

		$add.addLot = function($ctrl){
			var data = $scope.lot;
			console.log(data);
			$http({
				method	: 'POST', 
				url		: '/addLot',
				data 	: data
			}).then(function(res){
        		$window.location.href = "#!/automated/schedule/" + res.data.data
				console.log(res);
				$ctrl.ok();
			}, function(error){
				console.log(error);
			});
		}

		$add.validateTemplate = function($ctrl){
			$http({
				method	: 'POST', 
				url		: '/getTemplateByPath',
				data 	: {
					activity 	: $rootScope.activity,
					template 	: $rootScope.template 
				}
			}).then(function(res){
				var existTemplate = res.data.data;

				if(existTemplate.length != 0){
					// Needs notif
					console.log("Template already exists as: " + existTemplate[0].label);
				} else {
					$ctrl.open('addActivityModal', false);
				}
				$ctrl.ok();
			}, function(error){
				console.log(error);
			});
		}

		$add.checkActivityLabel = function(label, type){
			if(!label){
				var randomString = Math.random().toString(36).substring(7);
				$rootScope.activity.label = type + "_" + randomString;
			}
		}

		$add.submitActivity = function($ctrl){
			var lot_id = $rootScope.activity.lot_id;
			var tempPath = $rootScope.template.path;
			var tempGrid = $rootScope.template.grid;
			var postActivity = function(activity){
				$http({
					method 	: 'POST',
					url 	: '/addActivity',
					data 	: activity
				}).then(function(res){
					$ctrl.ok();
					$rootScope.activity.id = res.data.data;
					$add.useActivity($ctrl);
				}, function(error){
					console.log(error);
				});
			}

			if($rootScope.activity.type == 'plow'){
				$http({
					method	: 'POST', 
					url		: '/addTemplate',
					data 	: [JSON.stringify(tempGrid), JSON.stringify(tempPath), lot_id]
				}).then(function(res){
					$rootScope.activity.template = res.data.data;
					postActivity($rootScope.activity);
				}, function(error){
					console.log(error);
				});
			} else {
				postActivity($rootScope.activity);
			}
		}

		$add.useActivity = function($ctrl){
			$ctrl.ok();
			$window.localStorage.setItem('activity', JSON.stringify($rootScope.activity));
			$window.localStorage.setItem('template', JSON.stringify($rootScope.template));
			$window.localStorage.setItem('event', JSON.stringify($rootScope.event));
    		$window.location.href = "#!/automated/autoPilot";
		}

		$add.getComputations = function(){
			var socketData = {
				type 	: $rootScope.activity.type, 
				path 	: $rootScope.template.path, 
				event 	: $rootScope.event
			}
			$rootScope.socket.emit('get-event-data', socketData);
			$rootScope.socket.on('returned-event-data', function(data){
				console.log(data);
				$rootScope.event.start = data.startTime;
				$rootScope.event.estimatedEndTime = data.estimatedEndTime;
				$rootScope.event.estimatedDuration = data.estimatedDuration;
				$scope.isLoading = false;
				$scope.$apply();
			})
		}
		
		$scope.validateForm = function(){
			console.log("Validating...");
			if($scope.lot){
				// console.log($scope.lot);
				if($scope.lot.name && $scope.lot.province && $scope.lot.length1 && $scope.lot.width){
					return true;
				} else {
					return false;
				}
				// if(!isNaN(parseInt($scope.lot.length1)) || !isNaN(parseInt($scope.lot.width))){
				// 	return true;
				// }
			}
		}

	}
]);

autoModule.controller("autoPilotCtrl", ["$rootScope", "$scope", "$window", "$location", "$http",
	function($rootScope, $scope, $window, $location, $http){
		
		console.log("Here in autoPilotCtrl");

		if($window.localStorage.getItem('activity') == null || 
			$window.localStorage.getItem('template') == null ||
			$window.localStorage.getItem('event') == null){
			$window.location.href = "#!/automated/";
			return;
		}

		if(!$rootScope.activity || !$rootScope.template || !$rootScope.event){
			$rootScope.activity = JSON.parse($window.localStorage.getItem('activity'));
			$rootScope.template = JSON.parse($window.localStorage.getItem('template'));
			$rootScope.event = JSON.parse($window.localStorage.getItem('event'));
			// console.log($rootScope.activity);
			// console.log($rootScope.template);
			// console.log($rootScope.event);
		}

		if($rootScope.activity.type != 'plow'){
			var activity = $rootScope.activity;
			var type = "";
			if(activity.type == 'seed'){
				type = 'plow';
			} else {
				type = 'seed';
			}

			// $http({
			// 	method 	: 'GET',
			// 	url 	: '/getLotActivities/' + activity.lot_id + '/' + type + '/' + activity.template
			// }).then(function(res){
			// 	console.log(res);
			// 	$scope.activityList = res.data;
			// 	console.log($scope.activityList);
			// }, function(error){
			// 	console.log(error);
			// });
		}

		$scope.startActivity = function(){

			// $scope.isExecuting = true;
			console.log($rootScope.activity);
			console.log($rootScope.event);

			$http({
				method	: 'POST',
				url 	: '/addEvent',
				data 	: $rootScope.event
			}).then(function(res){
				console.log(res);
				$rootScope.event.id = res.data.data;
				// $http({
				// 	method 	: 'POST',
				// 	url 	: '/addSequence',
				// 	data 	: {
				// 		activity_id : $rootScope.activity.id,
				// 		event_id 	: $rootScope.
				// 	}
				// }).then(function(res){

				// }, function(err){

				// });
				$rootScope.socket.emit('start-event', {
					path 	: $rootScope.template.path,
					activity: $rootScope.activity,
					event 	: $rootScope.event
				});

			}, function(err){
				console.log(err);
			});

		}

		$scope.setSelected = function(activity){
			// console.log(activity);
			$scope.selectedActivity = activity;
		}

		// $scope.tryUpdate = function(){
		// 	// console.log($rootScope.activity);
		// 	var data = {
		// 		activity_id	: 11,
		// 		status 		: 'success'
		// 	}
		// 	$http({
		// 		method	: 'PUT', 
		// 		url		: '/updateActivity',
		// 		data 	: data
		// 	}).then(function(res){
		// 		console.log(res);
		// 	}, function(error){
		// 		console.log(error);
		// 	});

		// }

		$rootScope.socket.on('finished', function(data){
			// console.log(data.message);
			console.log(data);
			// $http({
			// 	method	: 'PUT', 
			// 	url		: '/updateActivity',
			// 	data 	: {
			// 		activity_id 	: data.activity_id,
			// 		status 			: "success"
			// 	}
			// }).then(function(res){
			// 	console.log(res);
			// }, function(error){
			// 	console.log(error);
			// });
			$scope.isExecuting = false;
		})


	}
]);

