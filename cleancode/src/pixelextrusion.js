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
		console.log(tooltip);
		this.tooltip = tooltip;
		var action = tooltip["selectaction"];
		if (action == undefined) {
			console.log("Error setting up tooltip--you must specify a 'selectaction' attribute!");
		}
		
		var selectcolor;
		if (tooltip["selectcolor"] != undefined) {

		}
		
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


ThreeData.PixelExtrusion.prototype.onMouseMove = function(event) {
	if (this.intersected) {
		for (var i = 0; i < this.numshapetriangles * 9; i+=3 ) {
			var index = this.selectedshapeindex * (this.numshapetriangles * 9) + i;
			this.vertexcolors[index] = this.oldcolor.r;
			this.vertexcolors[index + 1] = this.oldcolor.g;
			this.vertexcolors[index + 2] = this.oldcolor.b;	
		}

		this.buffergeom.attributes.color.needsUpdate = true;
		this.intersected = false;
		$("#tooltip").hide();
	}
}

ThreeData.PixelExtrusion.prototype.addLabel = function(text, x, y) {
	var label = document.getElementById('tooltip');
	$(label).show();
	label.style.position = 'absolute';
	label.style.width = 100;
	label.style.height = 40;
	label.style.backgroundColor = "#EFEFEF";	
	label.innerHTML = text;
	label.style.top = y;
	label.style.left = x;
}

ThreeData.PixelExtrusion.prototype.onMouseDown = function(event, obj) {
	console.log(obj);
	
	obj.mouse = new THREE.Vector2();
	
	event.preventDefault();
	obj.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	obj.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	var cpos = obj.camera.position;
	var distance = Math.sqrt(cpos.x * cpos.x + cpos.y * cpos.y + cpos.z * cpos.z);

	var vector = new THREE.Vector3( obj.mouse.x, obj.mouse.y, 1);
	obj.projector.unprojectVector( vector, obj.camera );

	obj.raycaster.set( obj.camera.position, vector.sub( obj.camera.position ).normalize() );

	var intersects = obj.raycaster.intersectObject( obj.buffermesh );

	if ( intersects.length > 0 ) {
		var intersect = intersects[0];
		obj.selectedshapeindex = Math.floor(intersect.indices[0]/(obj.numshapetriangles * 3));

		for (var i = 0; i < obj.numshapetriangles * 9; i+=3 ) {
			var index = obj.selectedshapeindex * (obj.numshapetriangles * 9) + i;
			if (i==0) {
				obj.oldcolor = new THREE.Color(obj.vertexcolors[index], 
							   obj.vertexcolors[index + 1], 
							   obj.vertexcolors[index + 2]);
			}
			obj.vertexcolors[index] = 1;
			obj.vertexcolors[index + 1] = 1;
			obj.vertexcolors[index + 2] = 1;	
		}

		
		
		obj.addLabel("hello", event.clientX, event.clientY);
		obj.buffergeom.attributes.color.needsUpdate = true;
		obj.intersected = true;
	}
}


ThreeData.PixelExtrusion.prototype.onMouseUp = function(event) {
	if (this.intersected) {
		for (var i = 0; i < this.numshapetriangles * 9; i+=3 ) {
			var index = this.selectedshapeindex * (this.numshapetriangles * 9) + i;
			this.vertexcolors[index] = this.oldcolor.r;
			this.vertexcolors[index + 1] = this.oldcolor.g;
			this.vertexcolors[index + 2] = this.oldcolor.b;	
		}

		this.buffergeom.attributes.color.needsUpdate = true;
		this.intersected = false;
	}

	$("#tooltip").hide();
}			



ThreeData.PixelExtrusion.prototype.initRayCaster = function() {
	this.projector = new THREE.Projector();
	this.raycaster = new THREE.Raycaster();

	this.mouse = new THREE.Vector2();
	var label = document.createElement("div");
	label.id = "tooltip";

	document.body.appendChild(label);
	document.addEventListener('mousemove', this.onMouseMove(this), false);
	document.addEventListener('mousedown', this.onMouseDown(this), false);
	document.addEventListener('mouseup', this.onMouseUp(this), false);
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
ThreeData.PixelExtrusion.prototype.update = function() {
	if (this.tween) {
		TWEEN.update();
	}	

	if (this.tooltip) {
		var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1 );
		this.projector.unprojectVector( vector, this.camera );
		this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
	}
}

