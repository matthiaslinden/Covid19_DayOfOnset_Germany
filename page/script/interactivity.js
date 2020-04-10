onBodyLoad = function() {
	console.log(data)
	
	
	// Parse the Data
//	d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv", function(d) {

	  // List of subgroups = header of the csv files = soil condition here
	//  var subgroups = d.columns.slice(1)

	  // List of groups = species here = value of the first column called group -> I show them on the X axis
//	  var groups = d3.map(data, function(d){return(d.group)}).keys()
//		console.log(d);
	//	console.log(subgroups);
//		console.log(groups);
//	});
	
	
	var basegraph = new BaseGraph(0,document.getElementById("simpleRKIgraph"),data);
	basegraph.DrawGraph();
	
	var control = new Control(0,document.getElementById("GraphControl1"),data);
	control.AddSubscriber("first",basegraph);
	control.Draw();
}