var ThreeData = {VERSION: '1'};

ThreeData.Voronoi3D = function(file, containershape, colors, displaysites, sitecolor, opacity, scene) {
	this.file = file;
	this.containershape = containershape;
	this.colors = colors;
	this.displaysites = displaysites;
	this.sitecolor = sitecolor;
	this.opacity = opacity;
	this.scene = scene;
}

ThreeData.Voronoi3D.prototype.addParticle = function(point) {
	var geom = new THREE.SphereGeometry(0.03, 8, 6);
	var transparent = this.opacity < 1;
	var mat = new THREE.MeshBasicMaterial({color:this.sitecolor, transparent:transparent, opacity:this.opacity});
	var mesh = new THREE.Mesh(geom, mat);
	var transmat = new THREE.Matrix4();
	transmat.makeTranslation(point.x, point.y, point.z);
	mesh.applyMatrix(transmat);
	this.scene.add(mesh);
}

ThreeData.Voronoi3D.prototype.readDataString = function(filestring) {
	var shapestrings = filestring.split("\n\n");	
	for (var i = 0; i < shapestrings.length -1; i++) {
		// vertices, faceInds, normals
		var components = shapestrings[i].split("\n");
		var startind = (i==0) ? 0 : 1;
		var posString = components[startind];
		var vertString = components[startind + 1];
		var faceIndString = components[startind + 2];
		var normalString = components[startind + 3];
		
		if (this.displaysites) {
			var nextpos = eval(posString);
			this.addParticle(nextpos);				
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
		this.addGeometry(vertices, faceInds, normals, this.colors[i%3]);
	} 
}

ThreeData.Voronoi3D.prototype.addGeometry = function(vertices, faceInds, normals, color){
	var faces = [];	
	for (var i = 0; i < faceInds.length; i++) {
		var newfaces = triangulateFace(faceInds[i], normals[i], color, vertices);
		for (var j = 0; j < newfaces.length; j++) {
			faces.push(newfaces[j]);
		}
	}	

	var geom = new THREE.Geometry();
	geom.vertices = vertices;
	geom.faces = faces;
	
	var transparent = this.opacity < 1;
	var mat = new THREE.MeshBasicMaterial({color:color, transparent:transparent, opacity:this.opacity});
	var mesh = new THREE.Mesh(geom, mat);
	this.scene.add(mesh);
}

ThreeData.Voronoi3D.prototype.triangulateFace = function(faceInds, normal, color, verts) {
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

	return faces;
}



ThreeData.Voronoi3D.prototype.init = function() {
	var reader = new FileReader();
	var filestring;
	reader.readAsText(this.file);	
	reader.onload = function(event) {
		filestring = event.target.result;
		var d = JSON.stringify({data:filestring});	
		$.ajax({
			url:"/data",
			type: "post",
			processData:false,
			contentType:"application/json",
			data: d,
			success: function(text) {
				console.log("got to scucess");
				this.readDataString(text);
			},
			error: function(data, err) {
				console.log("error");
				console.log(err);
			}
		});
}



