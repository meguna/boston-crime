
/* initialize canvas */
canvas = document.getElementById('main');
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

/* variables to hold data loaded with fetch calls */
let geoJsonMap = {}, p1dots1000 = {}, p2dots1000 = {}, crimeAll = {};

/* dummy DOM nodes used to listen for changes */
const detachedContainer = document.createElement('custom');
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

/* load json files */
d3.json('mabosclipped.json')
    .then((geoJson) => {
        geoJsonMap = geoJson;
        drawMap(geoJsonMap);
    });

d3.csv('clustered_crime_data_p2_1000.csv')
    .then((p2dots) => {
        p2dots1000 = p2dots;
        bindData(p2dots1000, 'part2');
    });

d3.csv('clustered_crime_data_p1_1000.csv')
    .then((p1dots) => {
        p1dots1000 = p1dots;
        bindData(p1dots1000, 'part1');
    });

d3.csv('cleaned_crime_data.csv')
    .then((data) => {
        crimeAll = data;
        // console.log(geoJson);
        // ctx.beginPath();
        // ctx.strokeStyle = '#00ACAB';
        // ctx.globalAlpha = 0.2;
        // geoPathGenerator(geoJson);
        // ctx.stroke();
    });

/* make dummy DOM elements to make manipulation of points simpler */
const bindData = (data, part) => {
    const dataBinding = dataContainer.selectAll(`custom.${part}`)
        .data(data, d => d);

    dataBinding.enter()
        .append('custom')
        .classed(part, true);

    drawDots(part);
}

const exitData = (data, part) => {
    const dataBinding = dataContainer.selectAll(`custom.${part}`)
        .remove();
}

const drawDots = (ucrPart) => {
    const elements = dataContainer.selectAll(`custom.${ucrPart}`);
    elements.each((d) => {
        const node = d3.select(this);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        const coords = projection([+d['Long'],+d['Lat']]);
        const x = coords[0];
        const y = coords[1];
        const r = d['Size'] * 0.01 || 0.1;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = (ucrPart === 'part1') ? '#E8FF00' : '#00CBA6';
        ctx.fillStyle = (ucrPart === 'part3') ? '#FF00CF' : ctx.fillStyle;
        ctx.fill();
        ctx.closePath();
    })
}

const drawMap = (geoJson) => {
    /* draw ocean */
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#B3C9CC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* draw outer MA */
    ctx.fillStyle = '#C9E6E0';
    ctx.beginPath();
    geoPathGenerator(geoJson);
    ctx.fill();

    /* draw boston */
    const boston = geoJson.features.filter((feature) => {
        return feature.properties.TOWN === 'BOSTON';
    })
    const bostonCollec = {
        'type': 'FeatureCollection',
        'features': boston,
    }
    ctx.fillStyle = '#BFDAD5';
    ctx.beginPath();
    geoPathGenerator(bostonCollec);
    ctx.fill();

    /* draw borders */
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    geoPathGenerator(geoJson);
    ctx.stroke();


    /* draw labels */
    geoJson.features.forEach((place) => {
        const points = geoPathGenerator.centroid(place);
        ctx.font = "10px Helvetica";
        ctx.fillStyle = 'black';
        let text = '';
        if (place.properties['TOWN'] === 'BOSTON') {
            text = place.properties['Name'];
        }
        /* label boston neighborhoods */
        ctx.fillStyle = 'black';
        ctx.font = "10px Helvetica";
        ctx.fillText(text, points[0], points [1]);

        /* label surrounding MA towns */
        text = '';
        if (place.properties['TOWN'] !== 'BOSTON') {
            text = place.properties['TOWN'];
        }
        ctx.fillStyle = 'gray';
        ctx.font = "8px Helvetica";
        ctx.fillText(text, points[0], points [1]);
    })
}

d3.select(ctx.canvas)
    .call(d3.zoom()
        .scaleExtent([1, 10])
        .extent([[0, 0],[canvas.width, canvas.height]])
        .translateExtent([[0, 0],[canvas.width, canvas.height]])
        .on("zoom", () => zoomTransform(d3.event.transform))
        .on("end", () => zoomEnd(d3.event.transform))
    );

const zoomTransform = (transform) => {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    drawMap(geoJsonMap);
    ctx.restore();
}

const zoomEnd = (transform) => {
    ctx.save();
    console.log(transform.k);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    drawMap(geoJsonMap);
    if (transform.k < 10) {
        exitData(p1dots1000, 'part1');
        bindData(p1dots1000, 'part1');
        exitData(p2dots1000, 'part2');
        bindData(p2dots1000, 'part2');
    } else {
        const topLeft = projection.invert(transform.invert([canvas.width,canvas.height]));
        const bottomRight = projection.invert(transform.invert([0,0]));
        bindData(crimeAll.filter((crime) => {
            return (+crime['Lat'] > topLeft[1]) &&
            (+crime['Lat'] < bottomRight[1]) &&
            (+crime['Long'] < topLeft[0]) &&
            (+crime['Long'] > bottomRight[0]);
        }), 'part3');
    }
    ctx.restore();
}
