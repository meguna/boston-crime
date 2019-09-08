const shapefile = require("shapefile");

export const initCanvas = () => {
	const container = document.getElementById("main");
	const canvas = document.createElement('canvas');
	canvas.setAttribute("id","mainCanvas");
	container.appendChild(canvas);
	const ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#EFEFEF";
	ctx.fill();

	
}

