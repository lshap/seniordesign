var scene;
var controls;
var mesh;
var camera;
var renderer;
var particles;
var colorchoices;
var centercolor;
var showcenters;

function getFile() {
	console.log('got here');
	var request = new XMLHttpRequest();
	request.open("GET", '/printcustom.txt', true);
	request.responseType = "blob";
	var file;
	request.onload = function() {
		readData(request.response);	
	};

	request.send();
}	

function init()  {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, 
						window.innerWidth / window.innerHeight,
						0.1,
						1000 );
	controls = new THREE.OrbitControls(camera);
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xffffff, 1);
	renderer.setSize(document.getElementById('renderDiv').offsetWidth, 400);
	document.getElementById('renderDiv').appendChild( renderer.domElement );
	

	camera.position.set(0, 1, 5);
	animate();
}

function readDataString(filestring) {
	var partGeom = new THREE.Geometry();
	var shapestrings = filestring.split("\n\n");	
	//colors = [new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff)];
	for (var i = 0; i < shapestrings.length -1; i++) {
		// vertices, faceInds, normals
		var components = shapestrings[i].split("\n");
		var startind = (i==0) ? 0 : 1;
		var posString = components[startind];
		var vertString = components[startind + 1];
		var faceIndString = components[startind + 2];
		var normalString = components[startind + 3];
		
		if (showcenters) {
			var nextpos = eval(posString);
			partGeom.vertices.push(nextpos);
			addParticle(nextpos);				
		}	

		vertString = vertString.replace(/\(/g, "new THREE.Vector3(");
		vertString = vertString.replace(/\)/g, "),");
		var vertices = eval("[" + vertString + "]");

		faceIndString = faceIndString.replace(/\(/g, "["); 
		faceIndString = faceIndString.replace(/\)/g, "],"); 
		var faceInds = eval("[" + faceIndString + "]");

		normalString = normalString.replace(/\(/g, "new THREE.Vector3(");
		normalString = normalString.replace(/\)/g, "),");
		var normals = eval("[" + normalString + "]");
		addGeometry(vertices, faceInds, normals, colorchoices[i%3]);
	} 
}

function addParticle(point) {
	var geom = new THREE.SphereGeometry(0.03, 8, 6);
	var mat = new THREE.MeshBasicMaterial({color:centercolor, transparent:true, opacity:0.6});
	var mesh = new THREE.Mesh(geom, mat);
	var transmat = new THREE.Matrix4();
	transmat.makeTranslation(point.x, point.y, point.z);
	mesh.applyMatrix(transmat);
	scene.add(mesh);
}

function addParticleSystem(particleGeom){
	var particleSystemMat = new THREE.ParticleSystemMaterial({color:0x0000ff, size:0.1});
	var particles = new THREE.ParticleSystem(particleGeom, particleSystemMat);
	scene.add(particles);
}

function readData(file) {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var reader = new FileReader();
		reader.readAsText(file);	
		var filestring;
		reader.onload = function(event) {
			filestring = event.target.result;
			var shapestrings = filestring.split("\n\n");	
			var colors = [new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff)];
			for (var i = 0; i < shapestrings.length -1; i++) {
				// vertices, faceInds, normals
				var components = shapestrings[i].split("\n");
				var startind = (i==0) ? 0 : 1;
				var vertString = components[startind];
				var faceIndString = components[startind + 1];
				var normalString = components[startind + 2];
				
				vertString = vertString.replace(/\(/g, "new THREE.Vector3(");
				vertString = vertString.replace(/\)/g, "),");
				var vertices = eval("[" + vertString + "]");

				faceIndString = faceIndString.replace(/\(/g, "["); 
				faceIndString = faceIndString.replace(/\)/g, "],"); 
				var faceInds = eval("[" + faceIndString + "]");

				normalString = normalString.replace(/\(/g, "new THREE.Vector3(");
				normalString = normalString.replace(/\)/g, "),");
				var normals = eval("[" + normalString + "]");
				addGeometry(vertices, faceInds, normals, colors[i%3]);
			} 

		}	

	} else {
	  conosle.log("file api is not supported on this browser");
	}
}


function addGeometry(vertices, faceInds, normals, color){
	var faces = [];	
	var colors = [new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff)];
	var colorchoice = Math.floor(Math.random() * colors.length);
	//var color = colors[colorchoice];
	for (var i = 0; i < faceInds.length; i++) {
		var newfaces = triangulateFace(faceInds[i], normals[i], color, vertices);
		for (var j = 0; j < newfaces.length; j++) {
			faces.push(newfaces[j]);
		}
	}	

	var geom = new THREE.Geometry();
	geom.vertices = vertices;
	geom.faces = faces;
	
	var mat = new THREE.MeshBasicMaterial({color:color, transparent:true, opacity:0.3});
	var mesh = new THREE.Mesh(geom, mat);
	scene.add(mesh);
}

function triangulateFace(faceInds, normal, color, verts) {
	var faces = [];
	if (faceInds.length == 3) {
		faces.push(new THREE.Face3(faceInds[0], faceInds[1], faceInds[2], normal, color, 0));
	}	

	else {
		var origin = faceInds[0];
		for (var i = 1; i < faceInds.length - 1; i++) {
			var newface = new THREE.Face3(origin, faceInds[i], faceInds[i+1], normal, color, 0);
			faces.push(newface);
		}
	}
	
	/*var linegeom = new THREE.Geometry();	
	for (var i = 0; i < faceInds.length; i++) {
		var newVert = verts[faceInds[i]];
		linegeom.vertices.push(newVert);
	}
	var linemat = new THREE.LineBasicMaterial({color:0x0000ff});
	scene.add (new THREE.Line(linegeom, linemat));*/

	return faces;
}

function animate()  {
	requestAnimationFrame(animate);
	render();
}

function render()  {
	renderer.render(scene, camera);
}

function Voronoi3D(file, colors, showCenters, centerColor) {
	var reader = new FileReader();
	var filestring;
	colorchoices = colors;
	centercolor = centerColor;
	showcenters = showCenters;

	reader.readAsText(file);	
	reader.onload = function(event) {
		filestring = event.target.result;
		var d = JSON.stringify({data:filestring});	
		$.ajax({
			url:"/data",
			type: "post",
			//dataType:"text/plain",
			processData:false,
			contentType:"application/json",
			data: d,
			success: function(text) {
				console.log("got to scucess");
				readDataString(text);
			},
			error: function(data, err) {
				console.log("error");
				console.log(err);
			}
		});
	init();
}

}

/*$(document).ready(function () {
	$("#data").change(function(evt) {
		var file = evt.target.files[0];
		var reader = new FileReader();
		var filestring;
		reader.readAsText(file);	
		reader.onload = function(event) {
			filestring = event.target.result;
			var d = JSON.stringify({data:filestring});	
			//console.log(d);
			$.ajax({
				url:"/data",
				type: "post",
				//dataType:"text/plain",
				processData:false,
				contentType:"application/json",
				data: d,
				success: function(text) {
					console.log("got to scucess");
					//console.log(text);
					readDataString(text);
				},
				error: function(data, err) {
					console.log("error");
					console.log(err);
				}
			});
		}

	});

	init();
});*/
