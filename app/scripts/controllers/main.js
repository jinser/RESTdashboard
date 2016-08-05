'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adminApp
 */
angular.module('dashboardApp',[])
  .controller('MainCtrl',function($rootScope,$scope,Reuters_raw,uiGridConstants) {
  
  $scope.myData = [
    {
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
        "employed": true
    },
    {
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
        "employed": false
    },
    {
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
        "employed": false
    }
  ];
	
	//$scope.accessToken = $rootScope.accessToken;
	
	//hide the detail grid upon initialization
	//$scope.hideGrid = true;
	/*
	$scope.gridOptions1 = {
		enableFiltering:true, 
		enableRowSelection:true,
		enableSelectAll:false,
		multiSelect:false
	};
	$scope.gridOptions2 = {
		enableRowSelection:false,
		columnDefs:$scope.columns,
		enableGridMenu: true,
		exporterMenuPdf: false,
		exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location"))
	}
	
	//define column attributes of the glossary table
	$scope.gridOptions1.columnDefs = [
						{field:'Description',width:"47%",enableColumnResizing:true},
						{field:'Crncy',width:"8%",enableColumnResizing:true},
						{field:'Freq',width:"5%",enableColumnResizing:true},
						{field:'Category',width:"20%",enableColumnResizing:true},
						{field:'Country',width:"8%",enableColumnResizing:true},
						{field:'Symbol',width:"12%",enableColumnResizing:true},
					];
	
	//get all glossary terms from reut database
	Reuters_raw.find({
		filter: { fields:['Mlh_Symbol','Mlh_Country','Mlh_Category','DisplayName','Currency','Frequency']} 
	},
		function(result) {
			
			var all =[];
			//extract nested values from Reut's format and rename table column names for all including Mlh keys
			for(var i=0;i<result.length;i++) {
				all[i] ={'Description' : result[i].DisplayName.reut_key,
						 'Crncy'	   : result[i].Currency.reut_key,
					     'Freq'   : result[i].Frequency.reut_key, 
						 'Category'    : result[i].Mlh_Category,
						 'Country'     : result[i].Mlh_Country,
						 'Symbol'      : result[i].Mlh_Symbol
						 };
			}
						
			$scope.gridOptions1.data = all;
		}
	);
		
	//row selection listener
	$scope.gridOptions1.onRegisterApi = function(gridApi){
      //set gridApi on scope
      $scope.gridApi = gridApi;
	  
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
		 
		if(!row.isSelected) {
			$scope.gridOptions2.data = [];
			$scope.gridOptions2.columnDefs = [];
			$scope.hideGrid = true;
		}
		else {  
			var symbol = row.entity.Symbol; 
			var category = row.entity.Category;
			var country = row.entity.Country;
			$scope.getDetails(symbol,category,country);
			$scope.gridOptions2.exporterCsvFilename = category + '_' + country + '.csv';
			$scope.hideGrid = false;
		}
      });
	};
	$scope.getDetails = function(symbol,category,country) {
	Reuters_raw.find({
				filter: {
					fields:[
						'P','PE','DSPE','RI','DSRI','PI','CI','IY','RY','RA','CO','CX','DU','L','MV','DY','DSDY'
					],
					where:{
						Mlh_Symbol:symbol,
						Mlh_Category:category
					}
				}
			},
				function(result) {
					var dataObj = result[0];
					
					//get all keys as 1 symbol may have multiple data fields
					var datatypes=[];
					for(var datatype in dataObj) {
						//all objects will list more than just the keys we want, up to the key 'toJSON'
						if(datatype=='toJSON') {
							break;
						}
						datatypes.push(datatype);
					}
					
					var alldata=[];
					var grid2_columns = [];
					//extract the individual data fields
					for(var k = 0; k < datatypes.length;k++) {						
						//remove the starting and ending braces, '{' and '}' at the ends and 
						//split the data based on commas into an array
						var rawResult = JSON.stringify(dataObj[datatypes[k]]).replace(/[\{\}']+/g,'').split(',');
						
						//initialize the column header names
						var datatype_key = datatypes[k];
						var datatype_date = datatype_key + 'Date' ;
												
						var single_col_header = {};
						single_col_header['field'] = datatype_date;
						single_col_header['displayName'] = datatype_date;
						if(datatypes.length > 2) {
							single_col_header['width'] = '15%';
						}
						grid2_columns.push(single_col_header);
						
						var single_col_header2 = {};
						single_col_header2['field'] = datatype_key;
						single_col_header2['displayName'] = datatype_key;
						if(datatypes.length > 2) {
							single_col_header2['width'] = '15%';
						}
						grid2_columns.push(single_col_header2);
						
												
						var datatype_data=[];
						for(var i=0;i<rawResult.length;i++){
							//remove " " around the dates and 
							//split the data based on : to get date and values seprated
							var dateValueSeparated = rawResult[i].replace(/[\"\"']+/g,'').split(':');
							var temp = {};
							//initialize with previous array value if there are more than 1 datatype
							if(k!=0) {
								temp = alldata[i];
							}
							temp[datatype_date]=dateValueSeparated[0];
							temp[datatype_key]=dateValueSeparated[1];
							datatype_data[i] = temp;	
						}
						alldata = datatype_data;
					}
	
					$scope.gridOptions2.data = alldata;
					$scope.gridOptions2.exporterCsvFilename = category + '_' + country + '.csv';
					//if empty, need to initialize using $scope.columns
					if($scope.gridOptions2.columnDefs.length == 0) {
						//$scope.columns = grid2_columns;
						$scope.gridOptions2.columnDefs = grid2_columns;
					}
					//otherwise just add a new value
					else {
						$scope.gridOptions2.columnDefs = grid2_columns;
					}
										
					
				}
			);
	};*/
  });
