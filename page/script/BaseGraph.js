let DateText = function(date) {
	let d = date%100;
	let m = (date/100|0)%100;
	let y = 2000 + date/10000|0;
	m = ("0"+m).slice(-2);
	d = ("0"+d).slice(-2);
	
	return y+"/"+m+"/"+d;
}

class Control {
	constructor(parent,div,data) {
		this.parent = parent;
		this.div = div;
		
		this.data = data;
		this.subscribers = {};
	}
	
	AddSubscriber(k,c) {
		this.subscribers[k] = c;
	}
	
	Notify(params) {
		for(let k in this.subscribers) {
			let c = this.subscribers[k];
			c.Notify(params);
		}
	}
	
	Draw(data) {
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
		this.div.style.width = "100%";
		this.div.style.display = "flex";
		
		let ld = this.data.dates.length;
		let first = this.data.dates[0];
		let last = this.data.dates[ld-1];
		
		let buttons = document.createElement("div");
		buttons.style.width = "15%";
		this.Buttons(buttons);
		
		let tfirst = document.createElement("div");
		tfirst.innerHTML = DateText(first);
		let tlast = document.createElement("div");
		tlast.innerHTML = DateText(last);
		this.picked = document.createElement("div");
		this.picked.innerHTML = " Report Datum : "+DateText(last);
		let spc = document.createElement("div");
		spc.style.width = "2%";
			
		let sliderdiv = document.createElement("div");
		sliderdiv.classList.add("pslidecontainer");
		let slider = document.createElement("input");
		slider.type = "range";
		slider.min = 0;
		slider.max = ld-1;
		slider.value = ld-1;
		slider.style.width="250px";
		slider.classList.add("pslider")
		slider.addEventListener('mousemove',this.MoveSlider.bind(this));
		slider.addEventListener('change',this.MoveSlider.bind(this));
		slider.addEventListener('touchmove',this.MoveSlider.bind(this));
		sliderdiv.appendChild(slider);
		
		this.slider = slider;
		this.div.appendChild(buttons);
		this.div.appendChild(tfirst);
		this.div.appendChild(sliderdiv);
		this.div.appendChild(tlast);
		this.div.appendChild(spc);
		this.div.appendChild(this.picked);
	}
	
	MoveSlider(evt) {
		if (evt.buttons || evt.type == "change" || evt.type == "touchmove") {
			let pd = parseInt(this.slider.value);
			let date = this.data.dates[pd];
			this.picked.innerHTML = " Report Datum : "+DateText(date);
			this.Notify({"date":date,"date_index":pd});
		}
	}
	
	Buttons(div) {
		
	}
	
	ClickButton(evt) {
		console.log(evt);
	}
	
}


class BaseGraph{
	constructor(parent,div,data){
		this.parent = parent;
		this.div = div;
		this.data = data;
		this.selected_date = null;
		
		this.InitGraph(data);
	}
	
	Notify(params) {
		this.UpdateGraph(params["date"]);
	}
	
	InitGraph(data) {
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
	// Init shit
		var that = this;
	
	// Config graphix
		let margin = {top: 10, right: 30, bottom: 51, left: 58},
		width = 900 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;
		this.height = height, this.width = width, this.margin = margin;
	// Setup the SVG
		this.svg = d3.select("#"+this.div.id)
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform","translate(" + margin.left + "," + margin.top + ")");
				
	// Add a clipPath: everything out of this area won't be drawn.
		this.clip = this.svg.append("defs").append("svg:clipPath")
			.attr("id", "clip")
			.append("svg:rect")
			.attr("width", width )
			.attr("height", height )
			.attr("x", 0)
			.attr("y", 0);
	
	// Add Axis
		this.x = d3.scaleBand()
			.range([ 0, width ])
			.domain(data.days)
			.padding(0.2);
			
		this.svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(this.x))
			.selectAll("text")
				.attr("transform", "translate(.7,0)rotate(-45)")
				.style("text-anchor", "end");
				
	// Add Y axis
		this.y = d3.scaleLinear()
			.domain([0, 5000])
			.range([ height, 0]);
		this.yAxis = this.svg.append("g")
			.call(d3.axisLeft(this.y));
			
	// text label for the x axis
		this.svg.append("text")
			.attr("transform","translate(" + (this.width/2) + " ," + (this.height + this.margin.top + 38) + ")")
			.style("text-anchor", "middle")
			.text("Beginn der Erkrankung / date of onset of illness");
			
	// text label for the y axis
		this.svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - this.margin.left)
			.attr("x",0 - (this.height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Anzahl übermittelter Fälle / knwon number");
			
		// Groups
			this.colors = ["#03C","#16F","#D90","#FC0"];
			this.groups = ["date known","new knwon","new unknown","date unknown"];
			this.statusgroups = this.svg.selectAll("g.status").data(that.groups).enter()
				.append("g").attr("class","status")
				.style("fill",function(d,i){ return that.colors[i];  });
			
			
			var lclrs = this.colors.slice(0,4);
			lclrs.push("#038");
			this.lgrps = this.groups.slice(0,4);
			this.lgrps.push("total known");
			var lhgt = [14,14,14,14,2];
		// Legend
			this.svgLegend = this.svg.append("g")
				.attr("width", width).attr("height", height)
				
			this.legend = this.svgLegend.selectAll('.legend')
				.data(this.lgrps)
				.enter().append('g')
				.attr("class", "legend")
				.attr("transform", function (d, i) { return "translate(10," + (4-i) * 20 + ")" })

			this.legend.append('rect')
				.attr("x", 0)
				.attr("y", function(d,i) {return 6-lhgt[i]/2;})
				.attr("width", 14)
				.attr("height", function (d,i) { return lhgt[i]; })
				.style("fill", function (d, i) { return lclrs[i]; })
			
			this.legendtexts = this.legend.append('text')
				.attr("x", 20)
				.attr("y", 10)
				.text(function (d, i) { return that.lgrps[i]; })
				.attr("class", "textselected")
				.style("text-anchor", "start")
				.style("font-size", 15)
			
		// Labels
			this.lable = this.svg.append("g").attr('transform', 'translate(' + [margin.left - 0, margin.top] + ')');
			this.lable.text = this.lable.append("text");
	}
	
	DrawGraph(date) {
		var that = this;
		let data = this.data;
		if (typeof(date) === "undefined") {
			date = data.dates[data.dates.length-1];
		}
		let date_i = data.ddates[date];
		this.selected_date = date;

		let bydaydata = [[],[],[],[]];
		let sums = [0,0,0,0,0];
		data.days.forEach(function(d,i){
			let onsets = data.datasets["onsets"][date_i][i];
			let diff = data.datasets["onsets_diff"][date_i][i];
			let mdiff = data.datasets["meldungs_raw_diff"][date_i][i];
			let meldungs = data.datasets["meldungs_raw"][date_i][i];
			bydaydata[0].push({"y":onsets-diff,"h":onsets-diff});
			bydaydata[1].push({"y":onsets,"h":diff});
			if (mdiff < 0) {
				bydaydata[2].push({"y":onsets+meldungs,"h":-mdiff});
				bydaydata[3].push({"y":onsets+mdiff+meldungs,"h":Math.max(0,meldungs+mdiff)});
				
			} else {
				bydaydata[2].push({"y":onsets+mdiff,"h":mdiff});
				bydaydata[3].push({"y":onsets+meldungs,"h":Math.max(0,meldungs-mdiff)});
			}
			sums[0] += onsets-diff;
			sums[1] += diff;
			sums[2] += mdiff;
			sums[3] += meldungs-mdiff;
			sums[4] += data.datasets["onsets"][data.dates.length-1][i];
		});
		
	// Max-Line
		var maxdata = data.datasets["onsets"][data.dates.length-1];
		this.maxline = d3.line()
			.x( function(d,i) {return that.x(data.days[i])+that.x.bandwidth()/2} )
			.y( function(d,i) {return that.y(maxdata[i])} )

		this.maxlinesvg = this.svg.append("path")
			.data([data.datasets["onsets"][data.dates.length-1]])
			.attr("class","maxline")
			.attr("d",that.maxline);
	
	// Bars
		this.statusgroups.selectAll("rect")
			.data(function(d,i){ return bydaydata[i];})
			.enter()
			.append("rect")
				.attr("x", function(d,i) { return that.x(data.days[i]); })
				.attr("y", function(d,i) { return that.y(d.y); })
				.attr("width", this.x.bandwidth())
			//	.attr("height", function(d,i) { return that.height - that.y(data.datasets["onsets"][i]); })
				.attr("height",function(d,i) {return that.height-that.y(d.h)})
	// Legend
		this.legend.select("text").data(sums)
			.text(function (d, i) {return that.lgrps[i]+" ("+d+")"; })
	}
	
	UpdateGraph(date) {
		
		let data = this.data;
		let date_i = data.ddates[date];
		if (date != this.selected_date) {
			this.selected_date = date;
			
			let bydaydata = [[],[],[],[]];
			let sums = [0,0,0,0,0];
			let ymax = 0;
			data.days.forEach(function(d,i){
				let onsets = data.datasets["onsets"][date_i][i];
				let diff = data.datasets["onsets_diff"][date_i][i];
				let mdiff = data.datasets["meldungs_raw_diff"][date_i][i];
				let meldungs = data.datasets["meldungs_raw"][date_i][i];
				bydaydata[0].push({"y":onsets-diff,"h":onsets-diff});
				bydaydata[1].push({"y":onsets,"h":diff});
				if (mdiff < 0) {
					bydaydata[2].push({"y":onsets+meldungs,"h":-mdiff});
					bydaydata[3].push({"y":onsets+mdiff+meldungs,"h":Math.max(0,meldungs+mdiff)});
				} else {
					bydaydata[2].push({"y":onsets+mdiff,"h":mdiff});
					bydaydata[3].push({"y":onsets+meldungs,"h":Math.max(0,meldungs-mdiff)});
				}
				sums[0] += onsets-diff;
				sums[1] += diff;
				sums[2] += mdiff;
				sums[3] += meldungs-mdiff;
				sums[4] += data.datasets["onsets"][data.dates.length-1][i];
				ymax = Math.max(ymax,onsets+meldungs);
			});
			
			let md = Math.pow(10,Math.log10(ymax/2)|0)/2.;
			ymax = md * ((ymax/md|0)+1);
			ymax = Math.max(70,ymax);
			
//			this.svg.transition(200);
			this.y.domain([0,ymax]);
			let that = this;
			this.statusgroups.selectAll("rect").data(function(d,i){ return bydaydata[i];}).transition(2000)
				.attr("y",function(d,i) { return that.y(d.y); })
				.attr("height",function(d,i) {return that.height-that.y(d.h); })
			
			this.maxlinesvg.transition().duration(100).call(that.maxline)
				.attr("d",that.maxline)
			
			this.yAxis.transition().duration(100).call(d3.axisLeft(this.y));
		// Legend
			this.legend.select("text").data(sums)
				.text(function (d, i) { return that.lgrps[i]+" ("+d+")"; })
		
		}
	}
};
