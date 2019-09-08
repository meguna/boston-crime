const shapefile = require("shapefile");

const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.rect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#EFEFEF";
ctx.fill();
