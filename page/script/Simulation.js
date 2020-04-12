

class SimpleSimulation {
	constructor() {
		// Added 0,0,0,0,0,0 at front to account
		this.beta_cdf = [0,0,0,0,0,0,0.,0.00491916,0.02352803,0.05636757,0.10170166,0.15703675,0.21968239,0.28702961,0.35669877,0.42661544,0.49504277,0.56058609,0.62217988,0.67906329,0.73074888,0.77698751,0.81773189,0.85310031,0.88334175,0.90880332,0.92990054,0.94709092,0.96085107,0.9716573,0.97996988,0.98622072,0.9908043 ,0.99407172,0.99632737,0.99782808,0.99878438,0.99936331,0.99969271,0.99986625,0.99994913,0.9999839,0.9999961 ,0.99999938,0.99999995,1.,1.];
		this.beta = [0,0,0,0,0,0,0,0.00000000e+00,4.52950725e-01,1.03620909e+00,1.57861004e+00,2.03115639e+00,2.37754021e+00,2.61662457e+00,2.75524070e+00,2.80444213e+00,2.77731059e+00,2.68758694e+00,2.54879184e+00,2.37366014e+00,2.17378715e+00,1.95942337e+00,1.73937583e+00,1.52098673e+00,1.31016867e+00,1.11148056e+00,9.28232527e-01,7.62610166e-01,6.15810994e-01,4.88186934e-01,3.79388060e-01,2.88503618e-01,2.14197086e-01,1.54832635e-01,1.08590874e-01,7.35721957e-02,4.78864438e-02,2.97279784e-02,1.74355557e-02,9.53675265e-03,4.77699027e-03,2.13352620e-03,8.15128178e-04, 2.48512978e-04,5.30694926e-05,5.92321684e-06,1.35733194e-07,0.00000000e+00]

		this.mi_beta = this.beta.length-1;
	}
	
	Run(R,dR) {
		console.log(this.beta_cdf[4],this.beta_cdf[9],this.beta_cdf[19],this.beta_cdf[29]);
		let l = this.mi_beta*2+dR;
		let initial = this.mi_beta;
		let daily = new Array(l);
		daily.fill(1,0,initial);
		daily.fill(0,initial,l);
		
		for (let i = initial; i < l; i++) {
			let r = R;
			if (i > initial+dR) {
				r = 1;
			}
			daily[i] = daily[i-4]*r;
		}
		
		let repD = [];
		let rep = new Array(l);
		let deaths = new Array(l);
		deaths.fill(0,0,l);
		for (let i=0;i<l;i++) {
			let repDiff = new Array(l);
			repDiff.fill(0,0,l);
			
			let s = 0;
			for (let j=0;  j <= Math.min(this.mi_beta,i); j++) {
				let d = daily[i-j]*this.beta[j]/this.mi_beta;
				s += d;
				repDiff[i-j] = d;
			}
			rep[i] = s;
			repD.push(repDiff);
			
			if (i > 20) {
				deaths[i] = daily[i-20]*0.01;
			}
		}
		
		console.log(daily);
		console.log(rep[initial],rep[initial+dR],rep[initial+dR+7],rep[l-1]);
		// Outputs Daily increase, daily reporting
		console.log(repD);
		console.log(deaths);
		return {daily:daily,reports:rep,deaths:deaths,initial:initial};
	}
}


class SimpleSimulationGraph {
	constructor(parent,div) {
		this.parent = parent;
		this.div = div;
		
		let ss = new SimpleSimulation();
		ss.Run(1.3,21);
		this.DrawGraph();
	}
	
	DrawGraph() {
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
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
	
	// Add Axis
		this.x = d3.scaleLinear()
			.range([ 0, width ])
			.domain([0,200])
		
		this.svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(this.x))
			
	// Add Y axis
		this.y = d3.scaleLinear()
			.domain([0, 8])
			.range([ height, 0]);
		this.yAxis = this.svg.append("g")
			.call(d3.axisLeft(this.y));
		
//		this.lin
		
//		this.
	}
}