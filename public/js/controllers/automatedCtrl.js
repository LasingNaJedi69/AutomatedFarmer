'use strict';

var autoModule = angular.module("autoFarm.controllers.autoCtrl", ["ui.bootstrap"])
autoModule.controller("autoCtrl", ["$rootScope", "$scope", "$window", "$location", "$http", "$routeParams",
	function($rootScope, $scope, $window, $location, $http, $routeParams){
		// var socket;
		if($location.url() == '/automated'){
			$http({
				method	: 'GET', 
				url		: '/getLots'
			}).then(function(res){
				console.log(res.data);
				$rootScope.towns = res.data;
			}, function(error){
				console.log(error);
			});
		} else {
			// console.log($routeParams.lotid);
			$http({
				method	: 'GET', 
				url		: '/getLot/' + $routeParams.lotid
			}).then(function(res){
				$rootScope.towns = res.data;
				console.log($rootScope.towns);
			}, function(error){
				console.log(error);
			});
		}


		var socket = io('http://' + $rootScope.hostAddress + ':3000');
		console.log("Here in autoCtrl");
		$scope.xAxis = false;
		$scope.yAxis = false;
		$scope.axis = [[]];

		$scope.computeDimensions = function(length, width){
			// $scope.area = length*width;
			$scope.xAxis = computeRange(length);
			$scope.yAxis = computeRange(width);
			for(var i = 0; i < length; i++){
				$scope.axis[i] = [];
				for(var j = 0; j < width; j++){
					$scope.axis[i][j] = false;
				}
			}
		}

		$scope.printAxis = function(){
			console.log($scope.axis);
		}

		$scope.checkPath = function(){
			for(var i = 0; i < $scope.xAxis.length; i++){
				if(_.includes($scope.axis[i], true)){
					$scope.hasPath = true;
					break;
				}
				$scope.hasPath = false;
			}
		}

		$scope.toggleSelectAll = function(flag){
			$scope.hasPath = false;
			if(flag){
				$scope.hasPath = flag;
			}
			for(var i = 0; i < $scope.xAxis.length; i++){
				for(var j = 0; j < $scope.yAxis.length; j++){
					$scope.axis[i][j] = flag;
				}
			}
			console.log($scope.axis);
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

autoModule.controller("addLotCtrl", ["$scope", "$window", "$location", "$http",
	function($scope, $window, $location, $http){
		var $add = this;
		$add.addLot = function($ctrl){
			var data = {
				'name' 		: $add.name,
				'province' 	: $add.province,
				'town' 		: $add.town,
				'brgy' 		: $add.brgy,
				'length' 	: $add.length,
				'width' 	: $add.width
			}
			$http({
				method	: 'POST', 
				url		: '/addLot',
				data 	: data
			}).then(function(res){
        		$window.location.href = "#!/automated/" + res.data.lotid
				console.log(res);
				$ctrl.ok();
			}, function(error){
				console.log(error);
			});
		}	
		console.log("Here in addLotCtrl");
	}
]);

