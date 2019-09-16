"use strict";

/* initialize canvas */
const canvas = document.getElementById('main');
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

/* variables to hold data loaded with fetch calls */
let geoJsonMap = {}, p1dots1000 = {}, p2dots1000 = {}, crimeAll = {},
    p1dots5000 = {}, p2dots5000 = {};

/* zoom level */
let zoomLevel = 1;

/* dummy DOM nodes used to listen for changes */
const detachedContainer = document.createElement('custom');
const dataContainer = d3.select(detachedContainer);

/* set up D3 geo params */
const projection = d3
  .geoMercator()
  .center([-71.052483, 42.329706])
  .translate([canvas.width / 5, canvas.height / 4])
  .scale(200000);

const geoPathGenerator = d3
  .geoPath()
  .projection(projection)
  .pointRadius(3)
  .context(ctx);

/* initalize quad tree for search - before loading crime csv */
const quadtree = d3.quadtree()
    .extent([[0, 0], [canvas.width, canvas.height]])
    .x((d) => projection([+d['Long'], +d['Lat']])[0])
    .y((d) => projection([+d['Long'], +d['Lat']])[1]);

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

d3.csv('clustered_crime_data_p2_5000.csv')
    .then((p2dots) => {
        p2dots5000 = p2dots;
    });

d3.csv('clustered_crime_data_p1_5000.csv')
    .then((p1dots) => {
        p1dots5000 = p1dots;
    });

d3.csv('cleaned_crime_data.csv')
    .then((data) => {
        crimeAll = data;
        quadtree
            .addAll(crimeAll);
    });

/* make dummy DOM elements to make manipulation of points simpler */
const bindData = (data, part) => {
    const dataBinding = dataContainer.selectAll(`custom.${part}`)
        .data(data, d => d);

    dataBinding.enter()
        .append('custom')
        .classed(part, true);

    if (part !== 'part3') {
        drawDots(part);
    } else {
        drawDots3000(part);
    }
}

const exitData = (data, part) => {
    const dataBinding = dataContainer.selectAll(`custom.${part}`)
        .remove();
}

/* draw low resolution data points */
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

/* draw method specifically for highest resolution data */
const drawDots3000 = () => {
    const elements = dataContainer.selectAll(`custom.part3`);
    elements.each((d) => {
        const node = d3.select(this);
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        const coords = projection([+d['Long'],+d['Lat']]);
        /* add 1-5 pixels worth of jitter to the dots,
           since many are on exactly the same point */
        const jitter = (Math.random() * 5) + 1;
        const x = coords[0] + (Math.random() * jitter);
        const y = coords[1] + (Math.random() * jitter);
        const r = 0.5;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = (d['UCR_PART'] === 'Part One') ? '#E8FF00' : '#00CBA6';
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = (d['UCR_PART'] === 'Part One') ? '#D8EC00' : '#00AC8C';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    })
}

/* draw base map */
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

        points[0] -= 30;
        /* for some specific places, shift label location for legibility */
        if (place.properties['Name'].toUpperCase() == 'BAY VILLAGE') {
            points[1] += 12; //y
            points[0] -= 5; //x
        } else if (place.properties['Name'].toUpperCase() == 'CHINATOWN') {
            points[1] += 3; //y
            points[0] += 20; //x
        }
        ctx.font = "10px Brown";
        ctx.fillStyle = 'black';
        let text = '';
        if (place.properties['TOWN'] === 'BOSTON') {
            text = place.properties['Name'].toUpperCase();
        }
        /* label boston neighborhoods */
        ctx.fillStyle = 'black';
        ctx.font = "10px Brown";
        ctx.fillText(text, points[0], points [1]);

        /* label surrounding MA towns */
        text = '';
        if (place.properties['Name'] === '') {
            text = place.properties['TOWN'];
        }
        ctx.fillStyle = 'gray';
        ctx.font = "8px Brown";
        ctx.fillText(text, points[0], points [1]);
    })
}

/* attach zoom event handler to canvas */
d3.select(ctx.canvas)
    .call(d3.zoom()
        .scaleExtent([1, 15])
        .extent([[0, 0],[canvas.width, canvas.height]])
        .translateExtent([[0, 0],[canvas.width, canvas.height]])
        .clickDistance([canvas.width, canvas.height])
        .on("zoom", () => zoomTransform(d3.event.transform))
        .on("end", () => zoomEnd(d3.event.transform))
    );

/* set d3 zoom parameters */
const zoomTransform = (transform) => {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    drawMap(geoJsonMap);
    ctx.restore();
}

/* define behavior after zoom transformation is complete */
const zoomEnd = (transform) => {
    ctx.save();
    zoomLevel = transform.k;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    drawMap(geoJsonMap);
    /* for each transformation, exit out previous datapoints since they've
       been drawn in a different location on screen. Exit out data points
       at other data resolutions as well */
    if (transform.k < 3) {
        exitData(p1dots5000, 'part1');
        exitData(p2dots5000, 'part2');
        exitData(p1dots1000, 'part1');
        bindData(p1dots1000, 'part1');
        exitData(p2dots1000, 'part2');
        bindData(p2dots1000, 'part2');
        exitData(crimeAll, 'part3');

        d3.select('#main').on("click", null);
    } else if (transform.k < 10) {
        exitData(p1dots1000, 'part1');
        exitData(p2dots1000, 'part2');
        exitData(p1dots5000, 'part1');
        exitData(p2dots5000, 'part2');
        bindData(p1dots5000, 'part1');
        bindData(p2dots5000, 'part2');
        exitData(crimeAll, 'part3');

        d3.select('#main').on("click", null);
    } else {
        exitData(crimeAll, 'part3');
        /* filter 300k+ point dataset with visible bounding box of canvas */
        const topLeft = projection.invert(transform.invert([canvas.width,canvas.height]));
        const bottomRight = projection.invert(transform.invert([0,0]));
        bindData(crimeAll.filter((crime) => {
            return (+crime['Lat'] > topLeft[1]) &&
            (+crime['Lat'] < bottomRight[1]) &&
            (+crime['Long'] < topLeft[0]) &&
            (+crime['Long'] > bottomRight[0]);
        }), 'part3');

        /* when clicked, search quadtree for data point nearest to click loc */
        d3.select('#main').on("click", function() {
            const m = d3.mouse(this);
            const p = quadtree.find(m[0], m[1]);
            console.log(p);
        });
    }
    ctx.restore();
}

/* toggle legend */



