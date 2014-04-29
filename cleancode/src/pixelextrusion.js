/*
 * Pixel Extrusion data visualization class
 * Author: Lauren Shapiro
 *
 */
var ThreeData = {VERSION: '1'};
ThreeData.ShapeType = {
	SQUARE: 0,
	CYLINDER: 1,
	CONE: 2, 
}

ThreeData.PixelExtrusion = function(img, extrudecolor, data, datadescriptions, vertexcolors, shapetype, tooltip, scene, camera) {

	this.img = img;
	this.extrudecolor = extrudecolor;
	this.data = data;
	this.datdescriptions = datadescriptions;
	this.vertexcolors = vertexcolors;
	this.shapetype = shapetype;
	this.scene = scene;
	this.camera = camera;

	this.init();	


	if (tooltip != null) {
		this.tooltip = tooltip;
		this.initRayCaster();
	}
}


ThreeData.PixelExtrusion.prototype.init = function() {
	this.buffergeom = new THREE.BufferGeometry();	
	switch (this.shapetype) {
	case ThreeData.ShapeType.SQUARE:
		this.numshapetriangles = 12;
	break;
	case ThreeData.ShapeType.CYLINDER:
		this.numshapetriangles = 32;
	break;
	case ThreeData.ShapeType.CONE:
		this.numshapetriangles = 32;
	break;
	}
	var triangles = this.numshapetriangles * this.data.length; // 12 triangles per cube
	this.buffergeom.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		},

		normal: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		},

		color: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		}

	}
	
	this.positions = this.buffergeom.attributes.position.array;
	this.normals = this.buffergeom.attributes.normal.array;
	this.colors = this.buffergeom.attributes.color.array;
	this.loadImage(this.extrudeImage);
}

ThreeData.PixelExtrusion.prototype.loadImage = function(extrudeImage) {
	var image = new Image();
	image.src = this.img;	
	var obj = this;
	$(image).load(function () {
		$("body").append("<canvas id='imagecanvas'></canvas>");
		var imgcanvas = document.getElementById('imagecanvas');
		var ctxt = imgcanvas.getContext('2d');
		
		ctxt.canvas.width = image.width;
		ctxt.canvas.height = image.height;
		ctxt.drawImage(image, 0, 0);
		obj.imgdata = ctxt.getImageData(0,0, ctxt.canvas.width, ctxt.canvas.height);

		ctxt.canvas.width = 0;
		ctxt.canvas.height = 0;
		ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);

		$("#imagecanvas").hide();
		obj.extrudeImage();
	});	
;
}


ThreeData.PixelExtrusion.prototype.rgbToHex = function(r, g, b, a) {
	// convert to rgb
	var alpha = a / 255;
	var newr = r * alpha;
	var newg = g * alpha;
	var newb = b * alpha;

	// convert to hex
	var hex = ((newr << 16) | (newg << 8) | newb);
	return hex;
}

// converts pixel data to a 3D scene
ThreeData.PixelExtrusion.prototype.extrudeImage = function() {
	var ind = 0;
	var vertexColors = {name: "colors", colors:[]};
	var imagedata = this.imgdata.data;
	for (var i = 0; i < imagedata.length; i+= 4) {
		var color = this.rgbToHex(imagedata[i], imagedata[i + 1], imagedata[i + 2], imagedata[i + 3]);
		if (color == this.extrudecolor) {
			var pix = i/4;
			var x =  pix % this.imgdata.width;
			var z = pix / this.imgdata.width;
			var height = Math.random() * 4;
	
			var colordecision = Math.floor(Math.random() * this.vertexcolors.length);
			var drawcolor = new THREE.Color(this.vertexcolors[colordecision]);

			var mesh, geom, mat;
			switch(this.shapetype) {
				case ThreeData.ShapeType.SQUARE: 
					geom = new THREE.CubeGeometry(1, height, 1);
				break;	
				case ThreeData.ShapeType.CYLINDER: 
					geom = new THREE.CylinderGeometry(0.5, 0.5, height, 8, 1, false);
				break;	
				case ThreeData.ShapeType.CONE: 
					geom = new THREE.CylinderGeometry(0.005, 0.5, height, 8, 1, false);
				break;	
				default:
					geom = new THREE.CubeGeometry(1, height, 1);
			}

			var translate = new THREE.Matrix4();
			translate.makeTranslation(x - this.imgdata.width/2, height/2, z - this.imgdata.height/2);
			geom.applyMatrix(translate);
			this.addMesh(ind, geom, drawcolor);
			ind += geom.faces.length * 9;
		}
	}

	var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors});	

	this.buffermesh = new THREE.Mesh(this.buffergeom, material);
	this.scene.add(this.buffermesh);
}

ThreeData.PixelExtrusion.prototype.addMesh = function(i, geom, color) {
	var faces = geom.faces;
	for (var j = 0; j < faces.length; j++) {
		var face = faces[j];
		
		var va = geom.vertices[face.a];
		var vb = geom.vertices[face.b];	
		var vc = geom.vertices[face.c];	
		
		var index =  i + j * 9;  
		this.positions[index] = va.x;	
		this.positions[index + 1] = va.y;	
		this.positions[index + 2] = va.z;	
		
		this.positions[index + 3] = vb.x;	
		this.positions[index + 4] = vb.y;	
		this.positions[index + 5] = vb.z;	
			
		this.positions[index + 6] = vc.x;	
		this.positions[index + 7] = vc.y;	
		this.positions[index + 8] = vc.z;	

		this.colors[index] =     color.r; 
		this.colors[index + 1] = color.g; 
		this.colors[index + 2] = color.b; 
		
		this.colors[index + 3] =  color.r;
		this.colors[index + 4] =  color.g;
		this.colors[index + 5] =  color.b;
			
		this.colors[index + 6] =  color.r;
		this.colors[index + 7] =  color.g;
		this.colors[index + 8] =  color.b;

		var nx = face.normal.x;
		var ny = face.normal.y;
		var nz = face.normal.z	

		// set normals
		this.normals[index] = nx;	
		this.normals[index + 1] = ny;	
		this.normals[index + 2] = nz;	
		
		this.normals[index + 3] = nx;	
		this.normals[index + 4] = ny;	
		this.normals[index + 5] = nz;	
			
		this.normals[index + 6] = nx;	
		this.normals[index + 7] = ny;	
		this.normals[index + 8] = nz;;
	}
}


ThreeData.PixelExtrusion.prototype.initRayCaster = function() {

}


/*
 * adds geometry specified by geomToAdd with vertex colors = vertexCol at index i to the buffer geometry bufferG
 */
ThreeData.PixelExtrusion.prototype.addMeshToGeom = function(i, geomToAdd, bufferG, vertexCol) {
	var faces = geomToAdd.faces;
	var bpositions = bufferG.attributes.position.array;
	var bnormals = bufferG.attributes.normal.array;
	var bcolors = bufferG.attributes.color.array;
	
	for (var j = 0; j < faces.length; j++) {
		var face = faces[j];
		
		var va = geomToAdd.vertices[face.a];
		var vb = geomToAdd.vertices[face.b];	
		var vc = geomToAdd.vertices[face.c];	
		
		var index =  i + j * 9;  
		bpositions[index] = va.x;	
		bpositions[index + 1] = va.y;	
		bpositions[index + 2] = va.z;	
		
		bpositions[index + 3] = vb.x;	
		bpositions[index + 4] = vb.y;	
		bpositions[index + 5] = vb.z;	
			
		bpositions[index + 6] = vc.x;	
		bpositions[index + 7] = vc.y;	
		bpositions[index + 8] = vc.z;	

		bcolors[index] =     vertexCol.r; 
		bcolors[index + 1] = vertexCol.g; 
		bcolors[index + 2] = vertexCol.b; 
		
		bcolors[index + 3] =  vertexCol.r;
		bcolors[index + 4] =  vertexCol.g;
		bcolors[index + 5] =  vertexCol.b;
			
		bcolors[index + 6] =  vertexCol.r;
		bcolors[index + 7] =  vertexCol.g;
		bcolors[index + 8] =  vertexCol.b;

		var nx = face.normal.x;
		var ny = face.normal.y;
		var nz = face.normal.z	

		// set normals
		bnormals[index] = nx;	
		bnormals[index + 1] = ny;	
		bnormals[index + 2] = nz;	
		
		bnormals[index + 3] = nx;	
		bnormals[index + 4] = ny;	
		bnormals[index + 5] = nz;	
			
		bnormals[index + 6] = nx;	
		bnormals[index + 7] = ny;	
		bnormals[index + 8] = nz;;
	}
}


/* 
 * computes buffer geometry for an image with pixel data imagedata and extrude heights
 * provided by data
 */
ThreeData.PixelExtrusion.prototype.extrudeBufferMesh = function(imagedata, extrudecolor, data) {
	var ind = 0;
	var buffG = new THREE.BufferGeometry();	
	var triangles = this.numshapetriangles * data.length; // 12 triangles per cube

	buffG.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		},

		normal: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		},

		color: {
			itemSize: 3,
			array: new Float32Array( triangles * 3 * 3 ),
			numItems: triangles * 3 * 3
		}

	}

	var vertexColors = {name: "colors", colors:[]};
	var picData = imagedata.data;

	for (var i = 0; i < picData.length; i+= 4) {
		var color = this.rgbToHex(picData[i], picData[i + 1], picData[i + 2], picData[i + 3]);
		if (color == extrudecolor) {
			var pix = i/4;
			var x =  pix % imagedata.width;
			var z = pix / imagedata.width;

			var height;
			if (i/4 < data.length) {
				height = data[i / 4];
			}
			else {
				height = 0;
			}

			var colordecision = Math.floor(Math.random() * this.vertexcolors.length);
			var drawcolor = new THREE.Color(this.vertexcolors[colordecision]);

			var mesh, geom, mat;
			switch(this.shapetype) {
				case ThreeData.ShapeType.SQUARE: 
					geom = new THREE.CubeGeometry(1, height, 1);
				break;	
				case ThreeData.ShapeType.CYLINDER: 
					geom = new THREE.CylinderGeometry(0.5, 0.5, height, 8, 1, false);
				break;	
				case ThreeData.ShapeType.CONE: 
					geom = new THREE.CylinderGeometry(0.005, 0.5, height, 8, 1, false);
				break;	
				default:
					geom = new THREE.CubeGeometry(1, height, 1);
			}

			var translate = new THREE.Matrix4();
			translate.makeTranslation(x - imagedata.width/2, height/2, z - imagedata.height/2);
			geom.applyMatrix(translate);

			this.addMeshToGeom(ind, geom, buffG, drawcolor);
			ind += geom.faces.length * 9;
		}
	}

	return buffG;
}


/*
 * calculates an optionally looping tween to transform from one image extrusion to another
 */
ThreeData.PixelExtrusion.prototype.transform = function(newimagesrc, newextrudecolor, newdataset, delay, duration, loop) {
	var currpositions = this.positions;

	// load the new image
	var image = new Image();
	image.src = newimagesrc;
	var obj = this;

	$(image).load(function() {
		$("body").append("<canvas id='imagecanvas'></canvas>");
		
		var imgcanvas = document.getElementById('imagecanvas');
		var ctxt = imgcanvas.getContext('2d');
	
		ctxt.canvas.width = image.width;
		ctxt.canvas.height = image.height;
		ctxt.drawImage(image, 0, 0);

		var pixelData = ctxt.getImageData(0,0, ctxt.canvas.width, ctxt.canvas.height);
		ctxt.canvas.width = 0;

		ctxt.canvas.height = 0;
		ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);

		$("#imagecanvas").remove();
		var targetgeom = obj.extrudeBufferMesh(pixelData, newextrudecolor, newdataset);
		var targetpos1 = targetgeom.attributes.position.array;
		var targetpos2 = [];

		for (var i = 0; i < obj.positions.length; i++) {
			targetpos2.push(obj.positions[i]);
		}

		var repeat;
		if (loop == true) {
			repeat = Infinity;
		}
		else {
			repeat = 1;
		}

		// create the first tween
		obj.tween = new TWEEN.Tween(currpositions).to(targetpos1, duration)
							  .delay(delay)
							  .yoyo(loop)
							  .repeat(repeat)
							  .easing(TWEEN.Easing.Cubic.In);
		obj.tween.onUpdate(function () {
			for (var i = 0; i < obj.positions.length; i++) {
				if (i < targetpos1.length) {
					obj.positions[i] = currpositions[i]; 
				}
			
			}

			obj.buffergeom.attributes.position.needsUpdate = true;
		});

		obj.tween.start();
	});	
}

/*
 * updates a tween if it exists
 */
ThreeData.PixelExtrusion.prototype.updateTransform = function() {
	if (this.tween) {
		TWEEN.update();
	}	
}

