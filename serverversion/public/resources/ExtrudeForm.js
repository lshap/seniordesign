
ExtrudeForm.shape = {
	CIRCLE : 0,
	SQUARE : 1,
	TRIANGLE: 2,
	CUSTOM : 3
}

ExtrudeForm.path = {
	STRAIGHT : 0,
	SPIRAL : 1,
	PERLIN : 2,
	CUSTOM : 3	
}

/*
 * Constructor
 * baseShape: Enum shape type
 * basePts: array of points defining base shape--only used if shape == shape.CUSTOM, 
 * height: total height of extruded form
 * extrudePath: Enum path type
 * pathPts: array of points defining extrude path--only used if path == path.CUSTOM, 
 * taper: whether or not the point scales down as it is extruded
 *
 */
function ExtrudeForm (baseShape, basePts, height, extrudePath, pathPts, taper) {
	this.baseShape = baseShape;
	this.basePts = basePts;
	this.height = height;
	this.extrudePath = extrudePath;
	this.pathPts = pathPts;
	this.taper = taper;
	this.scale = 0; // internal scale variable to animate extrusion
}


/*
 * initialzation
 *
 */
ExtrudeForm.prototype.init = function () {
	// init the base shape points
	switch(this.baseShape) {
		case shape.CIRCLE:
			this.basePts = [];
			var angle = (2 * Math.PI)/50;
			for (i = 0; i < 50; i++) {
				var x = Math.cos(angle * i);
				var y = Math.sin(angle * i);
				this.basePts.push( new THREE.Vector2(x,y));
			}
		break;
		
		case shape.SQUARE:
			this.basePts = [];
			this.basePts.push( new THREE.Vector2(1,1));
			this.basePts.push( new THREE.Vector2(-1,1));
			this.basePts.push( new THREE.Vector2(-1,-1));
			this.basePts.push( new THREE.Vector2(1,-1));
		break;

		case shape.TRIANGLE:
			this.basePts = [];
			this.basePts.push(new THREE.Vector2(0, 1));
			this.basePts.push(new THREE.Vector2( ));
			this.basePts.push(new THREE.Vector2());
		break;

		case shape.CUSTOM:
		break;

		default:
		break;
	}	
}


/*
 * step function to gradually extrude the form
 * 
 */
ExtrudeForm.prototype.step = function () {
	if (this.scale < 10) {
		var numBasePoints = this.basePts.length; 
		for (i = 1; i < this.height * numBasePoints; i++ ) {
			for (j = 0; j < ; j++) {
				var ind = i * numBasePoints + j;
				this.extrudemesh.geometry.vertices[ind].z += 0.01 * i;
			}
		} 

	this.scale ++;
	}
}
