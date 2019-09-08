function setupCanvas(canvas) {
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

setupCanvas(document.getElementById('main'));

const canvas = document.getElementById('main');
const ctx = canvas.getContext("2d");

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
  .context(ctx);

d3
  .json("mabos.json")
  .then((geoJson) => {

    const boston = geoJson.features.filter((feature) => {
        return feature.properties.TOWN === 'BOSTON';
    })
    const bostonCollec = {
        "type": "FeatureCollection",
        "features": boston,
    }
    ctx.fillStyle = "#A1FFEE";
    ctx.beginPath();
    geoPathGenerator(bostonCollec);
    ctx.fill();


    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    geoPathGenerator(geoJson);
    ctx.stroke();
  });


d3
  .json("crime.json")
  .then((geoJson) => {
      console.log(geoJson);

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 0.25;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.2;
    geoPathGenerator(geoJson);
    ctx.stroke();
  });


