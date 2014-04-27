

			var scene;
			var camera;
			var renderer;
			var frameCount = 0;
			var controls;

			function VoronoiDiagram(pts, colors) {
				var maxX = Number.MIN_VALUE;
				var maxY = Number.MIN_VALUE;
			
				var minX = Number.MAX_VALUE;
				var minY = Number.MAX_VALUE;

				for (var i = 0; i < pts.length; i++) {
					var p = pts[i];
					if (p.x > maxX) {
						maxX = p.x;
				}
					if (p.y > maxY) {
						maxY = p.y;
					}

					if (p.x < minX) {
						minX = p.x;
				}
					if (p.y < minY) {
						minY = p.y;
					}
				} 
				
				this.voronoi = new Voronoi();
				this.padding = 1.5;
				this.maxX = maxX + this.padding;
				this.maxY = maxY + this.padding;
				this.minX = minX - this.padding;
				this.minY = minY - this.padding;

				var bbox = {xl:this.minX, xr:this.maxX, yt:this.minY, yb:this.maxY};
				this.diagram = this.voronoi.compute(pts, bbox);	
				this.colors = colors;
				console.log(this.diagram.cells[0]);
			}


			VoronoiDiagram.prototype.initScene = function () {
				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 75, 
									window.innerWidth / window.innerHeight,
									0.1,
									1000 );
				controls = new THREE.OrbitControls(camera, document.body);
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor(0xffffff, 1);
				renderer.setSize( window.innerWidth, window.innerHeight);
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor(0xffffff, 1);
				renderer.setSize(window.innerWidth, window.innerHeight);
				document.body.appendChild(renderer.domElement);

				camera.position.set(0.5, 0.2, 0.5);
				
				/*var XaxisMat = new THREE.LineBasicMaterial({color:0xff0000});
				var YaxisMat = new THREE.LineBasicMaterial({color:0x00ff00});
				var ZaxisMat = new THREE.LineBasicMaterial({color:0x0000ff});

				var xGeom = new THREE.Geometry();
				var yGeom = new THREE.Geometry();
				var zGeom = new THREE.Geometry();

				xGeom.vertices.push(new THREE.Vector3(-10, 0, 0));
				xGeom.vertices.push(new THREE.Vector3(-10, 0, 0));
				var X = new THREE.Line(xGeom, XaxisMat);
				scene.add(X);	

				yGeom.vertices.push(new THREE.Vector3(0, -10, 0));
				yGeom.vertices.push(new THREE.Vector3(0, 10, 0));
				var Y = new THREE.Line(yGeom, YaxisMat);
				scene.add(Y);
				
				zGeom.vertices.push(new THREE.Vector3(0, 0, -10));
				zGeom.vertices.push(new THREE.Vector3(0, 0, 10));
				var Z = new THREE.Line(zGeom, ZaxisMat);
				scene.add(Z);	*/
			}

			function animate() {
				requestAnimationFrame(animate);
				render();
			}

			function render() {
				renderer.render(scene, camera);
				frameCount++;
			}
		
			function calculateNormal(v1,v2,v3) {
				var v1v2 = new THREE.Vector3();
				var v1v3 = new THREE.Vector3();
				v1v2.subVectors(v2, v1);
				v1v3.subVectors(v3, v1);

				var normal = new THREE.Vector3();
				normal.crossVectors(v1v2,v1v3);
				normal.normalize();
				return normal;
			}
	
			function lineGeometry(start, end, thickness) {
				var geometry = new THREE.Geometry();
				var slopeDenom = end.x - start.x;
				var offsetx, offsety;
				if (slopeDenom == 0) {
					offsety = 0;
					offsetx = thickness;
				}
				else {
					var slope = (end.y - start.y)/slopeDenom;
					if (slope > 0) {
						offsetx = thickness/Math.sqrt(2);
						offsety = -offsetx;
					}
					else if (slope < 0) {
						offsety = -thickness/Math.sqrt(2);
						offsetx = offsety;
					}
					else {
						offsetx = 0;
						offsety = thickness;
					}
				}	

				var v1 = new THREE.Vector3(start.x, 0, start.y);
				var v2 = new THREE.Vector3(end.x, 0, end.y);
				var v3 = new THREE.Vector3(end.x + offsetx, 0, end.y + offsety);
				var v4 = new THREE.Vector3(start.x + offsetx, 0, start.y + offsety);
					
				var v5 = new THREE.Vector3(start.x, 0.2, start.y);
				var v6 = new THREE.Vector3(end.x, 0.2, end.y);
				var v7 = new THREE.Vector3(end.x + offsetx, 0.2, end.y + offsety);
				var v8 = new THREE.Vector3(start.x + offsetx, 0.2, start.y + offsety);
				
				geometry.vertices.push(v1);
				geometry.vertices.push(v2);
				geometry.vertices.push(v3);
				geometry.vertices.push(v4);

				geometry.vertices.push(v5);
				geometry.vertices.push(v6);
				geometry.vertices.push(v7);
				geometry.vertices.push(v8); 

				// bottom: v1, v2, v3, v4
				geometry.faces.push(new THREE.Face3(0, 1, 2));
				var n1 = calculateNormal(v1, v2, v3);
				geometry.faces[0].normal = n1;

				geometry.faces.push(new THREE.Face3(2, 3, 0));
				geometry.faces[1].normal = n1;

				// top: v5, v6, v7, v8
				geometry.faces.push(new THREE.Face3(4, 7, 6));
				var n2 = calculateNormal(v5, v8, v7);
				geometry.faces[2].normal = n2;

				geometry.faces.push(new THREE.Face3(6, 5, 4));
				geometry.faces[3].normal = n2;

				// up: v5, v6, v2, v1
				geometry.faces.push(new THREE.Face3(4, 5, 1));
				var n3 = calculateNormal(v5, v6, v2);
				geometry.faces[4].normal = n3;

				geometry.faces.push(new THREE.Face3(1, 0, 4));
				geometry.faces[5].normal = n3;

				// down: v4, v3 v7, v8
				geometry.faces.push(new THREE.Face3(3, 2, 6));
				var n4 = calculateNormal(v4, v3, v7);
				geometry.faces[6].normal = n4;

				geometry.faces.push(new THREE.Face3(6, 7, 3));
				geometry.faces[7].normal = n4;

				// left: v1, v5, v8, v4
				geometry.faces.push(new THREE.Face3(0, 4, 7));
				var n5 = calculateNormal(v1, v5, v8);
				geometry.faces[8].normal = n5;

				geometry.faces.push(new THREE.Face3(7, 3, 0));
				geometry.faces[9].normal = n5;

				// right: v2, v6, v7, v3
				geometry.faces.push(new THREE.Face3(1, 5, 6)); 
				var n6 = calculateNormal(v2, v6, v7);
				geometry.faces[10].normal = n6;

				geometry.faces.push(new THREE.Face3(6, 2, 1)); 
				geometry.faces[11].normal = n6;
				return geometry;
			}

			VoronoiDiagram.prototype.computeCentroid = function(shapePts) {
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


			VoronoiDiagram.prototype.addClipShape = function(clipsvg) {
				var path = $(clipsvg[0]).attr("d");
				var shape = transformSVGPath(path);
				var shapeGeom = new THREE.ShapeGeometry(shape);

				var maxshapex = Number.MIN_VALUE;
				var maxshapey = Number.MIN_VALUE;

				var minshapex = Number.MAX_VALUE;
				var minshapey = Number.MAX_VALUE;
				
				for (var i = 0; i < shapeGeom.vertices.length; i++) {
					var curr = shapeGeom.vertices[i];
					if (curr.x > maxshapex) {
						maxshapex = curr.x;
					}	

					if (curr.y > maxshapey) {
						maxshapey = curr.y;
					}	

					if (curr.x < minshapex) {
						minshapex = curr.x;
					}	

					if (curr.y < minshapey) {
						minshapey = curr.y;
					}	
				}

				var scalex = (this.maxX - this.minX)/(maxshapex - minshapex);
				var scaley = (this.maxY - this.minY)/(maxshapey - minshapey);
				var scale = Math.max(scalex, scaley);

				//console.log("scale x = " + scalex + " scale y = " + scaley);
	
				var scalemat = new THREE.Matrix4();
				scalemat.makeScale(scale, scale, 1);
				shapeGeom.applyMatrix(scalemat);

				var mat = new THREE.MeshBasicMaterial({color:0xff0000});
				var rotmat = new THREE.Matrix4();
				rotmat.makeRotationX(Math.PI/2);

				shapeGeom.applyMatrix(rotmat);
				var centroid = this.computeCentroid(shapeGeom.vertices);
				
				var transmat = new THREE.Matrix4();
				
				var centroid = this.computeCentroid(shapeGeom.vertices);
				console.log("centroid = " + centroid.x + "," + centroid.y);
				transmat.makeTranslation(-centroid.x, 0, -centroid.y);

				shapeGeom.applyMatrix(transmat);

				var mesh = new THREE.Mesh(shapeGeom, mat);
				scene.add(mesh);
				this.clipvertices = shapeGeom.vertices;
				this.createDiagram();
				animate();
			}

			function shapeGeom(halfedges) {
				var pts = [];

				var h = halfedges[0];
				var hs = h.getStartpoint();
				var he = h.getEndpoint();
				pts.push(new THREE.Vector2(hs.x, hs.y));	
				pts.push(new THREE.Vector2(he.x, he.y));	

				var last = he;
				for (var i = 1; i < halfedges.length; i++) {
					var h = halfedges[i];
					var hs = h.getStartpoint();
					var he = h.getEndpoint();
					if (hs.x == last.x && hs.y == last.y) {
						pts.push(new THREE.Vector2(he.x, he.y));
						last = he;
					}
					else if (he.x == last.x && he.y == last.y) {
						pts.push(new THREE.Vector2(hs.x, hs.y));
						last = hs;
					}
					else {
						//console.log("neither equal");
					}
				}
			
				if (pts[0].x == pts[pts.length - 1].x && 
					pts[0].y == pts[pts.length - 1].y) {
					pts.splice(pts.length -1, 1);
				}

				var shape = new THREE.Shape(pts);
				return shape;
			}

			VoronoiDiagram.prototype.extrudeGeom = function(halfedges) {
				var extrudeSettings = {amount:0.1, steps: 1, bevelEnabled:false};
				var shape = shapeGeom(halfedges);

				var shapeclipper = new ShapeClipper(shape.vertices, this.clipvertices); 
				var clippedshapes = shapeclipper.getClippedShapes();	

				var shapes = [];
				if (clippedshapes.length > 0) {
					shapes = clippedshapes;	
				}

				else {
					shapes.push(shape);
				}
			
				var shapes3d = [];
				for (var i = 0; i < shapes.length; i++) {
					var nextshape = shapes[i];
					var shape3d = nextshape.extrude(extrudeSettings);

					var scalemat = new THREE.Matrix4();
					var amount = 2;
					scalemat.makeScale(1, 1, amount);
					shape3d.applyMatrix(scalemat);

					var rotmat = new THREE.Matrix4();
					rotmat.makeRotationX(Math.PI/2);
					shape3d.applyMatrix(rotmat);


					var outlinepts = [];
					outlinepts.push(new THREE.Vector2(this.maxX, this.maxY));
					outlinepts.push(new THREE.Vector2(this.minX, this.maxY));
					outlinepts.push(new THREE.Vector2(this.minX, this.minY));
					outlinepts.push(new THREE.Vector2(this.maxX, this.minY));

					var outlineshapegeom = new THREE.ShapeGeometry(new THREE.Shape(outlinepts));
					outlineshapegeom.applyMatrix(rotmat);


					var centroid = this.computeCentroid(outlineshapegeom.vertices);
					var transmat = new THREE.Matrix4();

					transmat.makeTranslation(-centroid.x, 0, -centroid.y); 
					shape3d.applyMatrix(transmat);
					outlineshapegeom.applyMatrix(transmat);
					centroid = this.computeCentroid(outlineshapegeom);
					shapes3d.push(shape3d);
				}
				
				return shapes3d;
			}

			VoronoiDiagram.prototype.screenshot = function (imagename) {
				filename= imagename + ".png";
				var dataUrl = renderer.domElement.toDataURL(filename);
				return dataUrl;
			}		
	
			VoronoiDiagram.prototype.createDiagram = function() {
				var cells = this.diagram.cells;
				var logged = false;

				for (var i = 0; i < cells.length; i++) {
					// get next site
					var halfedges = cells[i].halfedges;

					/*if (!logged) {
						console.log(halfedges);
						logged = true;
					}*/

					var geom = this.extrudeGeom(halfedges);
					var colorInd = Math.floor(Math.random() * this.colors.length);
					var col = this.colors[colorInd];

					var mat = new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.25});
					// var mat = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
					var extmesh = new THREE.Mesh(geom, mat);
					scene.add(extmesh);

				}
			}
