var app = angular.module('app', ['ngTouch', 'ui.grid','ui.grid.selection','ui.grid.cellNav', 'ui.grid.pinning', 'ui.grid.resizeColumns','d3']);
 
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
  
  //retrieve value of current visible data before passing it on to d3
  $rootScope.$on("getVisibleData", function() {
   getVisibleGridData();
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
  
  //cannot be run during initialization, get 'core' undefined as grid has not been initialized
  function getVisibleGridData() {
    $rootScope.visibleData = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);
    $rootScope.headerColumnStatus = $scope.gridOptions.columnDefs;
  };
 
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

app.controller('VisualizeCtrl',['$rootScope','$scope', function($rootScope,$scope) {
   //get current visible grid data from main controller, only needs to be pressed once, value is updated after
    $scope.showVisuals = function() {
      $rootScope.$emit("getVisibleData", {});
      removeHiddenColumnData();
      $rootScope.$emit("loadNewGraph", {});
    };
    
    //manually remove all data points belonging to hidden columns
    function removeHiddenColumnData() {
      var visibleCols = getVisibleColumns();
      
      $rootScope.finalData = []; //contains the data for plotting to d3
      $rootScope.finalDataColHeaders = new Object(); //contains the column headers for plotting on d3
      
      //check if any columns are hidden before removing those data points
      if(visibleCols.length != $rootScope.headerColumnStatus.length) {
        var rawData = $rootScope.visibleData;
        
        for(var i =0; i < rawData.length;i++) {
          $rootScope.finalData[i] = {};
          if(rawData[i].visible != false) {
            //get all data points with the column names
            for(var j=0;j < visibleCols.length;j++) {
              for(var key in rawData[i].entity) {
                if(key == visibleCols[j]) {
                  $rootScope.finalData[i][key] = rawData[i].entity[key];
                  if($rootScope.finalDataColHeaders[key] == null) {
                    $rootScope.finalDataColHeaders[key] = key;
                  }
                }
              }
            }
          }
        }
      }
      
    };
    
    //get all visible columns
    function getVisibleColumns() {
      
      var allHeaders = $rootScope.headerColumnStatus;
      var visibleColumns = [];
      
      for (var i = 0; i < allHeaders.length; i++) {
        if(allHeaders[i].visible != false) {
          visibleColumns.push(allHeaders[i].name);
        }
      }
      return visibleColumns;
    };
    
    
}]);

app.directive('simpleLineChart', ['d3Service','$rootScope', function(d3Service,$rootScope) {

  $rootScope.$on("loadNewGraph", function() {
   initGraph();
  });
  
  function initGraph(scope,element,attrs) {
    d3Service.d3().then(function(d3) {

    //set dimensions of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

      //set the ranges
      var x = d3.scaleLinear().range([0, width]);
      var y = d3.scaleLinear().range([height, 0]);
      
      //define the graph's axis
      var xAxis = d3.axisBottom().scale(x);
      var yAxis = d3.axisLeft().scale(y);

      //define the line
      var line = d3.line()
        .x(function(d) { return x(d.xAxisData); })
        .y(function(d) { return y(d.yAxisData); });
      
    //remove previous graphs and add the svg canvas  
      var reset = d3.select("svg").remove();
      var svg = d3.select("#d3chart").append('svg')
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
       .append('g')
       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      
      var xAxisLabel = Object.keys($rootScope.finalDataColHeaders)[0];
      var yAxisLabel = Object.keys($rootScope.finalDataColHeaders)[1];
      
      //data type check and conversion, change string objects into number
      $rootScope.finalData.forEach(function(d){
        //turn string objects into number using string length
        if(typeof d[Object.keys($rootScope.finalDataColHeaders)[0]] == "string") {
            d[Object.keys($rootScope.finalDataColHeaders)[0]] = d[Object.keys($rootScope.finalDataColHeaders)[0]].length;
            if(xAxisLabel == Object.keys($rootScope.finalDataColHeaders)[0]) {
              xAxisLabel = xAxisLabel.concat(" letter count");
            }
        }
        
        if(typeof d[Object.keys($rootScope.finalDataColHeaders)[1]] == "string") {
            d[Object.keys($rootScope.finalDataColHeaders)[1]] = d[Object.keys($rootScope.finalDataColHeaders)[1]].length;
            if(yAxisLabel == Object.keys($rootScope.finalDataColHeaders)[1]) {
              yAxisLabel = yAxisLabel.concat(" letter count");
            }
        }
        
      });
      
      $rootScope.finalData.forEach(function(d) {
        d.xAxisData = d[Object.keys($rootScope.finalDataColHeaders)[0]]
        d.yAxisData = d[Object.keys($rootScope.finalDataColHeaders)[1]];
      });

      //does nothing if there is no data
      if(typeof $rootScope.finalData == "undefined") {
        return;
      }

      //scale the range of the data
      x.domain(d3.extent($rootScope.finalData, function(d) { return d.xAxisData; })); 
      y.domain(d3.extent($rootScope.finalData, function(d) { return d.yAxisData; })); 
      
      //add the X and Y axis
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Price ($)');
      
      //add the X axis labels
      svg.append("text")      
        .attr("x", width / 2 )
        .attr("y",  height + margin.bottom)
        .style("text-anchor", "middle")
        .text(xAxisLabel);
        
      //add the Y axis labels
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yAxisLabel);
      
      //add the valueline path
      svg.append('path')
        .datum($rootScope.finalData)
        .attr('class', 'line')
        .attr('d', line);
    });
  };
  
return {
  restrict: 'EA',
  scope: {},
  link: function(scope, element, attrs) {
    
  }};
}]);