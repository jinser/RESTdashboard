var app = angular.module('app', ['ngTouch', 'ui.grid','ui.grid.selection','ui.grid.cellNav', 'ui.grid.pinning', 'ui.grid.resizeColumns']);
 
app.controller('MainCtrl', ['$scope','$rootScope','$http','$timeout', 'modal', function ($scope,$rootScope,$http,$timeout,modal) {
  //hide the detail grid upon initialization
	$scope.hideGrid = true;
	
	//set default input REST web service ti placeholder
  $scope.url = {
      text: 'https://jsonplaceholder.typicode.com/users'
    };
      
  //initialize grid options
  $scope.gridOptions = {
    enableFiltering:true, 
		enableRowSelection:true,
		enableColumnResizing:true,
		enableSelectAll:false,
		multiSelect:false,
		data:'data',
		showGridFooter: true
  }
    
  getUrlData();
    
  //handle refresh of data in the grid
  $scope.refreshUrl = function() {
      $scope.gridOptions.columnDefs = [];
      $timeout(function() {
        getUrlData();
      }, 0);
  };
  
  //cell selection functionality
   $scope.gridOptions.onRegisterApi = function(gridApi){
     $scope.gridApi = gridApi;
     
     gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
       getCellValue();
     });
  };
  
  //modal functionality - retrieve value of selected cell before opening a new window
  $rootScope.$on("getCellValue", function(){
    getCellValue();
  });
      
  //get current cell's value and save to rootScope
  function getCellValue() {
    var values = [];
    var currentSelection = $scope.gridApi.cellNav.getCurrentSelection();
    for (var i = 0; i < currentSelection.length; i++) {
      values.push(currentSelection[i].row.entity[currentSelection[i].col.name])
    }
    $rootScope.cellValue = values;
  }
 
 //update grid's data from url
 function getUrlData() {
    $http.get($scope.url.text).success(function(data) {
      $scope.data = data;
    });
 };

}]);

app.controller('ModalCtrl', ['$rootScope', '$scope', '$http', 'modal', '$interval', function ($rootScope, $scope, $http, modal, $interval) {

  //initialize grid options for modal window
  $rootScope.gridOptions2 = {
    enableFiltering:true, 
  	enableRowSelection:false,
  	enableSelectAll:false,
  	enableColumnResizing:true,
  	multiSelect:false,
  	data:'data2',
  	showGridFooter: true,
  	
  	onRegisterApi: function (gridApi) {
      $rootScope.gridApi = gridApi;
      // call resize every 500 ms for 5 s after modal finishes opening - usually only necessary on a bootstrap modal
      $interval( function() {
        $rootScope.gridApi.core.handleWindowResize();
      }, 500, 10);
      }
  }
  
  var myModal = new modal();
 
  $scope.showModal = function() {
    //get selected cell value from main controller
    $rootScope.$emit("getCellValue", {});
    
    //reset columns
    $rootScope.gridOptions2.columnDefs = [];
    //update value
    $rootScope.data2 = $rootScope.cellValue;
    
    //only open new window if data contains json
    if(typeof($rootScope.data2[0]) == 'object') {
      myModal.open();   
    }
    
  };
}]);
 
app.factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
  return function() {
    var elm;
    var modal = {
      open: function() {
        var html = '<div class="modal" ng-style="modalStyle">{{modalStyle}}<div class="modal-dialog"><div class="modal-content"><div class="modal-header"></div><div class="modal-body"><div id="grid2" ui-grid="gridOptions2" class="grid"></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
        
        elm = angular.element(html);
        angular.element(document.body).prepend(elm);
        
        $rootScope.close = function() {
          modal.close();
        };
 
        $rootScope.modalStyle = {"display": "block"};
 
        $compile(elm)($rootScope);
      },
      close: function() {
        if (elm) {
          elm.remove();
        }
      }
    };
 
    return modal;
  };
}]);