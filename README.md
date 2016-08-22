# Description
This dashboard allows anyone to enter a REST web service URL to view the data using angular-ui-grid and d3.js line graph.

The button "Get Nested Data" allows 2nd-order nested JSON data to be viewed in a grid in a new modal popup.

The button "Generate Line Graph" creates a line graph where the x-axis is the first column and the y-axis is the second column selected from the grid. 

## Using the Line Graph Functionality
1. Hide columns that are not required and leave only 2 columns behind. 
2. Click on the Generate Line Graph button
3. Graph will be generated, string values are automatically converted to a number using the string length

## Workspace

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.


### Running and deploying on Cloud9 IDE
To deploy, run the command 'grunt serve' and then get the application link by going to the Share button and selecting the Application link