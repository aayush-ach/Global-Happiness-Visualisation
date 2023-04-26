
const margin = { top: 10, right: 60, bottom: 200, left: 100 },
	width = 920 - margin.left - margin.right,
	height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#my_dataviz")
	.append("svg")
	.attr("class", "dsviz")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		`translate(${margin.left}, ${margin.top})`);

//Read the data


function update(happy_data, gdp_data, year, countries) {
	svg.remove();
	svg = d3.select(".dsviz")
		.append("g")
		.attr("transform",
			`translate(${margin.left}, ${margin.top})`);
	// svg = d3.select("#my_dataviz")
	const filtered_happy = happy_data
		.filter(x => countries.includes(x["Country"]))
		.map(x => ({ ...x, happiness_percent: x["Economy (GDP per Capita)"] / x["Happiness Score"] }));

	const x = d3.scalePoint()
		.domain(countries)
		.range([0, width]);

	const colors = [...Array(25).keys()].map(x => d3.interpolateInferno(1 - ((x + 1) / 25)));

	const color = d3.scaleOrdinal()
		.domain(filtered_happy.sort((b, a) => Number(b["Happiness Rank"]) - Number(a["Happiness Rank"])).map(x => x["Country"]))
		.range(colors);

	const opposite = d3.scaleOrdinal()
	.domain(colors)
	.range([...Array(25).keys()].map(x => x + 1));


	function drawColorScale() {
		var pallete = svg.append('g')
			.attr('id', 'pallete')
			.attr('transform', `translate(120, ${height + 100})`);

		var swatch = pallete.selectAll('rect').data(colors);
		swatch.enter().append('rect')
			.attr('fill', function (d) {
				return d;
			})
			.attr('x', function (d, i) {
				return i * 20;
			})
			.attr('y', 50)
			.attr('width', 20)
			.attr('height', 10);

		var texts = pallete.selectAll("foo")
			.data(color.range())
			.enter()
			.append("text")
			.attr("font-size", "10px")
			.attr("text-anchor", "middle")
			.attr("y", 80)
			.attr('x', function (d, i) {
				return i * 20 + 10;
			})
			.text(function (d) {
				return (opposite(d))
			})
		
		svg.append("text")
			.attr("font-size", "10px")
			.attr("text-anchor", "middle")
			.attr("y", height + 120)
			.attr("x", width / 2)
			.text("Happiness Rank");


	}
	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	const y = d3.scaleLinear()
		.domain([0, Math.min(d3.max(filtered_happy, d => d["happiness_percent"]) + 0.1, 1)])
		.range([height, 0])

	svg.append("g")
		.call(d3.axisLeft(y).tickFormat(d3.format("0.2%")));

	svg.append('g')
		.selectAll("dot")
		.data(filtered_happy) // the .filter part is just to keep a few dots on the chart, not all of them
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d["Country"]); })
		.attr("cy", function (d) { return y(d["happiness_percent"]); })
		.attr("r", 7)
		.style("fill", d => color(d["Country"]))
		.style("opacity", 0.5)
		.style("stroke", "white")
		.on("mouseover", function (event, d) {
			const data = d3.select(this).datum();
			tippy(this, {
				content: `${data.Country}<br>Happiness Rank: ${data["Happiness Rank"]}<br>Contribution of GDP to Happiness: ${data.happiness_percent.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}`,
				allowHTML: true
			})
		});
	drawColorScale();


}

let year = "2015";
let happydata;
let gdpdata;

d3.csv("GDP_f.csv", row => row)
	.then((gdp_data) => {
		gdpdata = gdp_data;
		update_on_sel();
	});

function update_on_sel() {
	const yearval = d3.select("#year").node().value;
	year = yearval;
	const typeval = d3.select("#type").node().value;
	let countries;
	d3.csv(`${year}.csv`).then(happy_data => {
		happydata = happy_data;
		if (typeval === 'rich') {
			countries = gdpdata
				.sort((b, a) => a[year] - b[year])
				.slice(0, 25)
				.map(x => x["Country"]);
		} else if (typeval === 'poor') {
			countries = gdpdata
				.sort((a, b) => a[year] - b[year])
				.slice(0, 25)
				.map(x => x["Country"]);
		} else if (typeval === 'happiest') {
			countries = happydata
				.sort((b, a) => Number(b["Happiness Rank"]) - Number(a["Happiness Rank"]))
				.slice(0, 25)
				.map(x => x["Country"]);
		} else {
			countries = happydata
				.sort((a, b) => Number(b["Happiness Rank"]) - Number(a["Happiness Rank"]))
				.slice(0, 25)
				.map(x => x["Country"]);
		}
		update(happydata, gdpdata, year, countries);
	})
}

d3.select("#type")
	.on('change', (event) => {
		update_on_sel();
	})

d3.select("#year")
	.on('change', (event) => {
		update_on_sel();
	})