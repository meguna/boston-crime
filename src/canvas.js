
/* initialize canvas */
const setupCanvas = (canvas) => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

setupCanvas(document.getElementById('main'));

const canvas = document.getElementById('main');
const ctx = canvas.getContext("2d", { alpha: false });

/* dummy DOM nodes used to listen for changes */
const detachedContainer = document.createElement("custom");
const dataContainer = d3.select('#main');

/* set up D3 geo params */
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const projection = d3
  .geoMercator()
  .center([-71.057083, 42.361145])
  .translate([canvas.width / 3, canvas.height / 3])
  .scale(200000);

const geoPathGenerator = d3
  .geoPath()
  .projection(projection)
  .pointRadius(3)
  .context(ctx);

// d3.json("crime.json")
//     .then((geoJson) => {
//         console.log(geoJson);
//         ctx.beginPath();
//         ctx.strokeStyle = "#00ACAB";
//         ctx.globalAlpha = 0.2;
//         geoPathGenerator(geoJson);
//         ctx.stroke();
//     });

const bindData = (data) => {
    console.log(data);
    const dataBinding = dataContainer.selectAll("custom.rect")
        .data(data, d => d);

    dataBinding
        .attr("fillStyle", "green");

    dataBinding.enter()
        .append("custom")
        .classed("rect", true)
        .attr("x", d => projection([d['Long'],d['Lat']])[0])
        .attr("y", d => projection([d['Long'],d['Lat']])[1])
        .attr("radius", 5)
        .attr("fillStyle", "black");

    drawCanvas();
}

const drawCanvas = () => {
    const elements = dataContainer.selectAll("custom.rect");
    elements.each((d) => {
        const node = d3.select(this);
        ctx.beginPath();
        const x = projection([d['Long'],d['Lat']])[0];
        const y = projection([d['Long'],d['Lat']])[1];
        const r = d['Size'] * 0.01;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#D8FF00";
        ctx.fill();
        ctx.closePath();
    })
}

d3.json("mabos.json")
    .then((geoJson) => {
        ctx.fillStyle = "#F2FAF8";
        ctx.beginPath();
        geoPathGenerator(geoJson);
        ctx.fill();
    
        const boston = geoJson.features.filter((feature) => {
            return feature.properties.TOWN === 'BOSTON';
        })
        const bostonCollec = {
            "type": "FeatureCollection",
            "features": boston,
        }
        ctx.fillStyle = "#BFDAD5";
        ctx.beginPath();
        geoPathGenerator(bostonCollec);
        ctx.fill();
    
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        geoPathGenerator(geoJson);
        ctx.stroke();

        // d3.json("p2_cluster.json")
        //     .then((geoJson) => {
        //         console.log(geoJson);
        //         ctx.globalAlpha = 1;
        //         ctx.beginPath();
        //         ctx.strokeStyle = "#00FF84";
        //         geoPathGenerator(geoJson);
        //         ctx.stroke();
        //     });

        d3.csv("clustered_crime_data_p2_1000.csv")
            .then((p2dots) => {
                // ctx.strokeStyle = "red";
                // for (let i = 0; i <p2dots.length; i++) {
                //     const set = p2dots[i];
                //     const point = projection(set["Long"], set["Lat"]);
                //     console.log(set["Long"], set["Lat"], point);
                //     ctx.globalAlpha = 1;
                //     ctx.fillStyle = "red";
                //     ctx.fillRect(point[0], point[1], point[0] + 5, point[1] +5);
                // }
                bindData(p2dots);
            });
    });




// d3.select(canvas).call(d3.zoom()
//     .scaleExtent([1, 8])
//     .on("zoom", () => zoomed(d3.event.transform)));

// const zoomed = (transform) => {
//     ctx.save();
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.translate(transform.x, transform.y);
//     ctx.scale(transform.k, transform.k);
//     ctx.beginPath();
//     for (const [x, y] of data) {
//         ctx.moveTo(x + r, y);
//         ctx.arc(x, y, r, 0, 2 * Math.PI);
//     }
//     ctx.fill();
//     ctx.restore();
// }

// zoomed(d3.zoomIdentity);

