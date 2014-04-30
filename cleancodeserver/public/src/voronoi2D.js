var ThreeData = {version:1};

ThreeData.Voronoi2D = function(pts, height, svgbase, colors, opacity, scene) {
	this.pts = pts;
	this.height = height;
	this.colors = colors;
	this.opacity = opacity;
	this.scene = scene;
	this.init();
}

ThreeData.Voronoi2D.prototype.init = function() {
	this.maxX = Number.MIN_VALUE;
	this.maxY = Number.MIN_VALUE;

	this.minX = Number.MAX_VALUE;
	this.minY = Number.MAX_VALUE;
	for (var i = 0; i < this.pts.length; i++) {
		var p = this.pts[i];
		if (p.x > this.maxX) {
			this.maxX = p.x;
		}
		if (p.y > this.maxY) {
			this.maxY = p.y;
		}

		if (p.x < this.minX) {
			this.minX = p.x;
		}
		if (p.y < this.minY) {
			this.minY = p.y;
		}
	} 
	
	this.voronoi = new Voronoi();
	var bbox = {xl:this.minX, xr:this.maxX, yt:this.minY, yb:this.maxY};
	this.diagram = this.voronoi.compute(this.pts, bbox);	

	var outlinepts = [];
	outlinepts.push(new THREE.Vector2(this.maxX, this.maxY));
	outlinepts.push(new THREE.Vector2(this.minX, this.maxY));
	outlinepts.push(new THREE.Vector2(this.minX, this.minY));
	outlinepts.push(new THREE.Vector2(this.maxX, this.minY));

	var outlineshapegeom = new THREE.ShapeGeometry(new THREE.Shape(outlinepts));
	var rotmat = new THREE.Matrix4();
	rotmat.makeRotationX(3 * Math.PI/2);

	outlineshapegeom.applyMatrix(rotmat);

	this.centroid = this.computeCentroid(outlineshapegeom.vertices);
	this.createDiagram();
}

ThreeData.Voronoi2D.prototype.createDiagram = function() {
	console.log(this.diagram);
	var cells = this.diagram.cells;
	for (var i = 0; i < cells.length; i++) {
		// get next site
		var halfedges = cells[i].halfedges;

		var geom = this.extrudeGeom(halfedges);
		var colorInd = Math.floor(Math.random() * this.colors.length);
		var col = this.colors[colorInd];

		var mat = new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:this.opacity});
		var extmesh = new THREE.Mesh(geom, mat);
		this.scene.add(extmesh);
	}
}

ThreeData.Voronoi2D.prototype.computeBoundingSphereRadius = function() {
	var outlinepts = [];
	outlinepts.push(new THREE.Vector2(this.maxX, this.maxY));
	outlinepts.push(new THREE.Vector2(this.minX, this.maxY));
	outlinepts.push(new THREE.Vector2(this.minX, this.minY));
	outlinepts.push(new THREE.Vector2(this.maxX, this.minY));

	var outlineshapegeom = new THREE.ShapeGeometry(new THREE.Shape(outlinepts));
	var rotmat = new THREE.Matrix4();
	rotmat.makeRotationX(3 * Math.PI/2);

	outlineshapegeom.applyMatrix(rotmat);
	outlineshapegeom.computeBoundingSphere();
	return outlineshapegeom.boundingSphere.radius;
}


ThreeData.Voronoi2D.prototype.computeCentroid = function(shapePts) {
	var xsum = 0;
	var zsum = 0;
	for (var i = 0; i < shapePts.length; i++) {
		xsum += shapePts[i].x;
		zsum+= shapePts[i].z;
	}

	xsum /= shapePts.length;
	zsum /= shapePts.length;
	return (new THREE.Vector2(xsum, zsum));
}

ThreeData.Voronoi2D.prototype.extrudeGeom = function(halfedges) {
	var points = [];
	var h = halfedges[0];
	var hs = h.getStartpoint();
	var he = h.getEndpoint();
	points.push(new THREE.Vector2(hs.x, hs.y));	
	points.push(new THREE.Vector2(he.x, he.y));	

	var last = he;
	for (var i = 1; i < halfedges.length; i++) {
		var h = halfedges[i];
		var hs = h.getStartpoint();
		var he = h.getEndpoint();
		if (hs.x == last.x && hs.y == last.y) {
			points.push(new THREE.Vector2(he.x, he.y));
			last = he;
		}
		else if (he.x == last.x && he.y == last.y) {
			points.push(new THREE.Vector2(hs.x, hs.y));
			last = hs;
		}
		else {
			//console.log("neither equal");
		}
	}
	
	if (points[0].x == points[points.length - 1].x && 
		points[0].y == points[points.length - 1].y) {
		points.splice(points.length -1, 1);
	}

	var extrudeSettings = {amount:0.1, steps: 1, bevelEnabled:false};
	var shape = new THREE.Shape(points);
	var shape3d = shape.extrude(extrudeSettings);

	var scalemat = new THREE.Matrix4();
	scalemat.makeScale(1, 1, this.height);
	shape3d.applyMatrix(scalemat);

	var rotmat = new THREE.Matrix4();
	rotmat.makeRotationX(3 * Math.PI/2);
	shape3d.applyMatrix(rotmat);

	var transmat = new THREE.Matrix4();
	
	transmat.makeTranslation(-this.centroid.x, 0, -this.centroid.y);
	shape3d.applyMatrix(transmat);

	return shape3d;	
}
