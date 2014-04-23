/*
 * Creates a 3D extrusion of a given source image
 * NOTE: Requires Three.js, JQuery, OrbitControls.js, and Tween.js
 */

			var scene;
			var camera;
			var renderer;
			var frameCount = 0;
			var controls;
			var scale = {y : 0.1};
			var imgdata;
			var condensedData;
			var numColoredPixels = 0;
			var buffermesh;
			var buffergeom;
			var numshapes = 0;
			var numshapetriangles;
			var cubeadded = false;
			var projector, raycaster, mouse, line;
			var changed = false;			
			var testgeom;
			var ocolors;
	
			// inputted fields
			var imgsrc;
			var data;
			var colorchoices;

			var positions;
			var normals;
			var colors;
			var shapeType;
			var animated;
			var animationTime;
			var triangles;
			var tween;
			var transformtween1;
			var transformtween2;

			var ShapeType = {
				SQUARE: 0,
				CYLINDER: 1,
				CONE: 2, 
				EXTRUDE: 3
			};

			// constructor
			function ImageExtrusion(img, inputdata, colors, shape, animate, time) {
				this.imgsrc = img;
				this.initWithImage = true;
				this.data = inputdata;
				this.colorchoices = colors;	
				this.shapeType = shape;
				this.animated = animate;
				this.animationTime = time;	
			} 
	
			function onMouseMove(event) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = ( event.clientY / window.innerWidth ) * 2 - 1;
			}

			function onMouseDown(event) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				var cpos = camera.position;
				var distance = Math.sqrt(cpos.x * cpos.x + cpos.y * cpos.y + cpos.z * cpos.z);
				//if (camera.rotation.x < 0.5 && distance < 120 || camera.rotation.x > 0.5 && distance < 30) {
					var vector = new THREE.Vector3( mouse.x, mouse.y, 1);
					projector.unprojectVector( vector, camera );

					raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

					var intersects = raycaster.intersectObject( buffermesh );

					if ( intersects.length > 0 ) {
						var intersect = intersects[0];
						var shapenum = Math.floor(intersect.indices[0]/(numshapetriangles * 3));

						console.log("shape number = " + shapenum);
						for (var i = 0; i < numshapetriangles * 9; i+=3 ) {
							var index = shapenum * (numshapetriangles * 9) + i;
							colors[index] = 1;
							colors[index + 1] = 1;
							colors[index + 2] = 1;	
						}

						buffergeom.attributes.color.needsUpdate = true;
					}
				//}
			}


			function onMouseUp(event) {
				line.visible = false;
			}

			// init function: initializes image extrusion scene 
			ImageExtrusion.prototype.init = function() {
				if (this.initWithImage) {
					this.loadImageData(this.extrudeImage);
				}
				
				// initialize 3D scene
				scene = new THREE.Scene();
				projector = new THREE.Projector();
				raycaster = new THREE.Raycaster();

				mouse = new THREE.Vector2();
	
				var light = new THREE.DirectionalLight( 0xffffff);
				light.position.set( 0,10,0);
				scene.add( light );
				var amblight = new THREE.AmbientLight( 0x404040 ); // soft white light
				scene.add( amblight );	
				document.addEventListener( 'mousemove', onMouseMove, false );
				document.addEventListener( 'mousedown', onMouseDown, false );
				document.addEventListener( 'mouseup', onMouseUp, false );

				camera = new THREE.PerspectiveCamera( 75, 
									window.innerWidth / window.innerHeight,
									0.1,
									1000 );

				var renderDiv = document.getElementById('renderDiv');
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor(0xffffff, 1);
				/*
				renderer.setSize(document.getElementById('renderDiv').offsetWidth, 500);
				document.getElementById('renderDiv').appendChild( renderer.domElement );*/
				renderer.setSize(window.innerWidth, window.innerHeight);
				document.body.appendChild(renderer.domElement);
				//controls = new THREE.OrbitControls(camera, document.getElementById('renderDiv'));
				controls = new THREE.OrbitControls(camera);
				camera.position.set(0, 50, 150);

				// set up buffer geometry
				buffergeom = new THREE.BufferGeometry();	

				numshapetriangles;
				switch (this.shapeType) {
				case ShapeType.SQUARE:
					numshapetriangles = 12;
				break;
				case ShapeType.CYLINDER:
					numshapetriangles = 32;
				break;
				case ShapeType.CONE:
					numshapetriangles = 32;
				break;
				case ShapeType.EXTRUDE:
					numshapetriangles = 172;
				break;
				}

				triangles = numshapetriangles * this.data.length; // 12 triangles per cube
				buffergeom.attributes = {
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
			

				// starting test code here ----	
				/*testgeom = new THREE.BufferGeometry();	
				testgeom.attributes = {
					position: {
						itemSize: 3,
						array: new Float32Array( 12 * 3 * 3 ),
						numItems: triangles * 3 * 3
					},

					normal: {
						itemSize: 3,
						array: new Float32Array( 12 * 3 * 3 ),
						numItems: triangles * 3 * 3
					},

					color: {
						itemSize: 3,
						array: new Float32Array( 12 * 3 * 3 ),
						numItems: triangles * 3 * 3
					}

				}

				opositions = testgeom.attributes.position.array;
				ocolors = testgeom.attributes.color.array;

				var cubeGeom = new THREE.CubeGeometry(50, 50, 50);	
				addMeshToGeom(0, cubeGeom, testgeom, new THREE.Color(1,1,0));	
				
				var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors});	
				var testmesh = new THREE.Mesh(testgeom,material);
				scene.add(testmesh); 	
				// end test code ----*/

				positions = buffergeom.attributes.position.array;
				normals = buffergeom.attributes.normal.array;
				colors = buffergeom.attributes.color.array;
	
				var linegeometry = new THREE.BufferGeometry();
				linegeometry.attributes = {
					position: {
						itemSize: 3,
						array: new Float32Array(4 * 3),
						numItems: 4 * 3
					}
				}


				var linematerial = new THREE.LineBasicMaterial({color:0xffffff});
				line = new THREE.Line(linegeometry, linematerial);
				scene.add(line);
				animate();
			}


			// function to add the ith triangle with vertices va, vb, vc
			ImageExtrusion.prototype.addTriangle = function(i, va, vb, vc) {
				var ax = va.x;
				var ay = va.y;
				var az = va.z;
				
				var bx = vb.x;
				var by = vb.y;
				var bz = vb.z;

				var cx = vc.x;
				var cy = vc.y;
				var cz = vc.z;
				
				var cb = new THREE.Vector3();
				cb.subVectors(vc, vb);
				var ab = new THREE.Vector3();	
				ab.subVectors(va, vb);
				cb.crossVectors(cb,ab);
				cb.normalize();
		
				var nx = cb.x;
				var ny = cb.y;
				var nz = cb.z;

				var index = i * 9;
	
				// set positions	
				positions[index] = ax;	
				positions[index + 1] = ay;	
				positions[index + 2] = az;	
				
				positions[index + 3] = bx;	
				positions[index + 4] = by;	
				positions[index + 5] = bz;	
					
				positions[index + 6] = cx;	
				positions[index + 7] = cy;	
				positions[index + 8] = cz;	

				// set normals
				normals[index] = nx;	
				normals[index + 1] = ny;	
				normals[index + 2] = nz;	
				
				normals[index + 3] = nx;	
				normals[index + 4] = ny;	
				normals[index + 5] = nz;	
					
				normals[index + 6] = nx;	
				normals[index + 7] = ny;	
				normals[index + 8] = nz;

				var colordecision = Math.floor(Math.random() * this.colorchoices.length);
				var drawcolor = this.colorchoices[colordecision];
	
	
				//set colors
				colors[index] = 0;	
				colors[index + 1] = 0;	
				colors[index + 2] = 1;	
				
				colors[index + 3] = 0;	
				colors[index + 4] = 0;
				colors[index + 5] = 1;
					
				colors[index + 6] = 0;	
				colors[index + 7] = 0;	
				colors[index + 8] = 1;
			}
				
			ImageExtrusion.prototype.addMesh = function(i, geom, color) {
				var faces = geom.faces;
				for (var j = 0; j < faces.length; j++) {
					var face = faces[j];
					
					var va = geom.vertices[face.a];
					var vb = geom.vertices[face.b];	
					var vc = geom.vertices[face.c];	
					
					var index =  i + j * 9;  
					positions[index] = va.x;	
					positions[index + 1] = va.y;	
					positions[index + 2] = va.z;	
					
					positions[index + 3] = vb.x;	
					positions[index + 4] = vb.y;	
					positions[index + 5] = vb.z;	
						
					positions[index + 6] = vc.x;	
					positions[index + 7] = vc.y;	
					positions[index + 8] = vc.z;	

					colors[index] =     color.r; 
					colors[index + 1] = color.g; 
					colors[index + 2] = color.b; 
					
					colors[index + 3] =  color.r;
					colors[index + 4] =  color.g;
					colors[index + 5] =  color.b;
						
					colors[index + 6] =  color.r;
					colors[index + 7] =  color.g;
					colors[index + 8] =  color.b;

					var nx = face.normal.x;
					var ny = face.normal.y;
					var nz = face.normal.z	

					// set normals
					normals[index] = nx;	
					normals[index + 1] = ny;	
					normals[index + 2] = nz;	
					
					normals[index + 3] = nx;	
					normals[index + 4] = ny;	
					normals[index + 5] = nz;	
						
					normals[index + 6] = nx;	
					normals[index + 7] = ny;	
					normals[index + 8] = nz;;
				}
			}

			ImageExtrusion.prototype.addCube = function(i, x, y, z, d, h) {
				// bottom square verts
				var v1 = new THREE.Vector3( 0, 0, 0 );
				var v2 = new THREE.Vector3( d, 0, 0 );
				var v3 = new THREE.Vector3( d, 0, d );
				var v4 = new THREE.Vector3( 0, 0, d );

				// top square verts
				var v1b = new THREE.Vector3( 0, h, 0 );
				var v2b = new THREE.Vector3( d, h, 0 );
				var v3b = new THREE.Vector3( d, h, d );
				var v4b = new THREE.Vector3( 0, h, d );
				
				var center = new THREE.Vector3(x, y, z);	

				v1.addVectors(v1, center);
				v2.addVectors(v2, center);
				v3.addVectors(v3, center);
				v4.addVectors(v4, center);

				v1b.addVectors(v1b, center);
				v2b.addVectors(v2b, center);
				v3b.addVectors(v3b, center);
				v4b.addVectors(v4b, center);
			
				// add triangles to cube
				// bottom face
				this.addTriangle(i, v4, v1, v2);
				this.addTriangle((i+1), v2, v3, v4);

				//top face
				this.addTriangle(i + 2, v4b, v2b, v1b);
				this.addTriangle(i + 3, v4b, v3b, v2b);

				this.addTriangle(i + 4, v1b, v2, v1);
				this.addTriangle(i + 5, v1b, v2b, v2);

				this.addTriangle(i + 6, v2b, v3, v2);
				this.addTriangle(i + 7, v2b, v3b, v3);

				this.addTriangle(i + 8, v3b, v4, v3);
				this.addTriangle(i + 9, v3b, v4b, v4);

				this.addTriangle(i + 10, v1, v4, v1b);
				this.addTriangle(i + 11, v4, v4b, v1b);
			}


			// rgba to hex converter
			function rgbToHex(r, g, b, a) {
				// convert to rgb
				var alpha = a / 255;
				var newr = r * alpha;
				var newg = g * alpha;
				var newb = b * alpha;
	
				// convert to hex
				var hex = ((newr << 16) | (newg << 8) | newb);
				return hex;
			}

			ImageExtrusion.prototype.resizeImage = function() {
				console.log('num colored pixels = ' + numColoredPixels);
				var numpix = numColoredPixels;	
				var imdata = imgdata.data;
				//console.log('imagedata in resize:');
				//console.log(imgdata);
				var numdatapts = this.data.length;
				var p = 0;

				// condense image if it is too large for data
				var scale = Math.floor(numpix/numdatapts);	
				console.log('scale = '+ scale);
				var imgsize = imgdata.height * imgdata.width;
				console.log('imgsize = ' + imgsize);
				
				condensedData = new Uint8ClampedArray(imdata.length/scale);
				console.log('condenseddata length = ' + condensedData.length);
				for (var i = 0; i < condensedData.length; i+= 4) {
					var r = 0, g = 0, b = 0, a = 0;

					// sum next scale number of pixels  	
					for (var j = i * scale ; j < i * scale + scale * 4; j+= 4) {
						if (j > imgdata.data.length) {

							console.log('j = ' + j + ' is out of bounds');
						}
						r += imgdata.data[j]; 
						g += imgdata.data[j + 1]; 
						b += imgdata.data[j + 2]; 
						a += imgdata.data[j + 3]; 
						//console.log('r = ' + r + ' g = ' + g + ' b= ' + b + ' a= ' + a );  
					}	
					//console.log('r = ' + r + ' g = ' + g + ' b= ' + b + ' a= ' + a );  

					r /= scale;	
					g /= scale;	
					b /= scale;	
					a /= scale;	
					
					condensedData[i] = r;
					condensedData[i + 1] = g;
					condensedData[i + 2] = b;
					condensedData[i + 3] = a;
					
					var color = rgbToHex(r, g, b, a);
					if (color == 0) {
						p++;
					}
				}
				console.log('new number of black pix = ' + p);
				imgdata.data = condensedData;
				
				// scale image up if it is too small
			}
			

			// method to generate geometry for an extruded swirl
			ImageExtrusion.prototype.getExtrudeGeometry = function (height) {
				var pts = [];
				var angle = (2 * Math.PI)/8;

				for (i = 0; i < 8; i++) {
					var x = Math.cos(angle * i);
					var y = Math.sin(angle * i);
					pts.push( new THREE.Vector2(x,y));
				}

				var splinePts = [];
				var sangle = (2 * Math.PI)/height;
				for (i = 0; i < height; i++) {
					var x = Math.cos(sangle * i);
					var y = Math.sin(sangle * i);
					var z = i;
					splinePts.push( new THREE.Vector3(x, y, z));
				}				

				var spline = new THREE.SplineCurve3(splinePts);
				var shape = new THREE.Shape(pts);
				var extrudeSettings = { amount:10,  bevelEnabled: false, 
							 steps:10, extrudePath: spline};			   
				var shape3d = shape.extrude(extrudeSettings);


				numpoints = shape3d.vertices.length;
				numBasePoints = pts.length;
				
				// move points inward to taper shape
				var numShapes = numpoints/numBasePoints;
				for (var i = 0; i < numShapes; i++) {
						for (j = 0; j < numBasePoints; j++) {
							var ind = i * numBasePoints + j;
							shape3d.vertices[ind].x *= 0.1 * (numShapes - i);
							shape3d.vertices[ind].y *= 0.1 * (numShapes - i);
						}
				}

				// rotate mesh so it grows from ground up
				var rotmat = new THREE.Matrix4();
				rotmat.makeRotationX(3 * Math.PI/2);
				shape3d.applyMatrix(rotmat);
				return shape3d;
			}

			function extrudeBufferGeometry(pixelData, shapetype, colorChoices) {
				var ind = 0;
				var buffG = new THREE.BufferGeometry();	

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
				var picData = pixelData.data;

				for (var i = 0; i < picData.length; i+= 4) {
					var color = rgbToHex(picData[i], picData[i + 1], picData[i + 2], picData[i + 3]);
					if (color == 0) {
						var pix = i/4;
						var x =  pix % pixelData.width;
						var z = pix / pixelData.width;
						var height = Math.random() * 4;
				
						var colordecision = Math.floor(Math.random() * colorChoices.length);
						var drawcolor = new THREE.Color(colorChoices[colordecision]);
	
						var mesh, geom, mat;
						switch(shapetype) {
							case ShapeType.SQUARE: 
								geom = new THREE.CubeGeometry(1, height, 1);
							break;	
							case ShapeType.CYLINDER: 
								geom = new THREE.CylinderGeometry(0.5, 0.5, height, 8, 1, false);
							break;	
							case ShapeType.CONE: 
								geom = new THREE.CylinderGeometry(0.005, 0.5, height, 8, 1, false);
							break;	
							case ShapeType.EXTRUDE:
								geom = this.getExtrudeGeometry(height);					 
							break;
							default:
								geom = new THREE.CubeGeometry(1, height, 1);
						}

						var translate = new THREE.Matrix4();
						translate.makeTranslation(x - pixelData.width/2, 0, z - pixelData.height/2);
						geom.applyMatrix(translate);

						addMeshToGeom(ind, geom, buffG, drawcolor);
						ind += geom.faces.length * 9;
					}
				}
				return buffG;
			}

			ImageExtrusion.prototype.transform = function(newimage) {
				console.log('calculating new obj...');
				this.getImageObject(newimage, this.colorchoices, this.shapeType, extrudeBufferGeometry);
			};

			function addMeshToGeom(i, geomToAdd, bufferG, vertexCol) {
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
	
			// converts pixel data to a 3D scene
			ImageExtrusion.prototype.extrudeImage = function() {
				var imagedata;
				imagedata = imgdata.data;
				this.pixelData = imgdata.data;

				var ind = 0;
				var vertexColors = {name: "colors", colors:[]};
				for (var i = 0; i < imagedata.length; i+= 4) {
					var color = rgbToHex(imagedata[i], imagedata[i + 1], imagedata[i + 2], imagedata[i + 3]);
					if (color == 0) {
						var pix = i/4;
						var x =  pix % imgdata.width;
						var z = pix / imgdata.width;
						var height = Math.random() * 4;
				
						var colordecision = Math.floor(Math.random() * this.colorchoices.length);
						var drawcolor = new THREE.Color(this.colorchoices[colordecision]);
	
						var mesh, geom, mat;
						switch(this.shapeType) {
							case ShapeType.SQUARE: 
								geom = new THREE.CubeGeometry(1, height, 1);
							break;	
							case ShapeType.CYLINDER: 
								geom = new THREE.CylinderGeometry(0.5, 0.5, height, 8, 1, false);
							break;	
							case ShapeType.CONE: 
								geom = new THREE.CylinderGeometry(0.005, 0.5, height, 8, 1, false);
							break;	
							case ShapeType.EXTRUDE:
								geom = this.getExtrudeGeometry(height);					 
							break;
							default:
								geom = new THREE.CubeGeometry(1, height, 1);
						}

						var translate = new THREE.Matrix4();
						translate.makeTranslation(x - imgdata.width/2, 0, z - imgdata.height/2);
						geom.applyMatrix(translate);
						this.addMesh(ind, geom, drawcolor);
						ind += geom.faces.length * 9;
					}
				}

				var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors});	

				//var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors});
				buffermesh = new THREE.Mesh(buffergeom, material);

				// start tween if animation specified
				if (this.animated) {
					tween = new TWEEN.Tween(scale).to({y:1}, this.animationTime);
					tween.onUpdate(function () {
						buffermesh.scale.y = scale.y;	
					});


					tween.start();
				}

				scene.add(buffermesh);
			}

			// returns the scene
			ImageExtrusion.prototype.getScene = function() {
				return scene;
			}

			ImageExtrusion.prototype.getPixelData = function() {
				return this.pixelData;
			}

			ImageExtrusion.prototype.exportScene = function() {
				var exporter = new THREE.ObjectExporter;
				var obj = exporter.parse(scene);
				var json = JSON.stringify(obj);
				return json;
			}


			ImageExtrusion.prototype.getImageObject = function(newimgsrc, colors, shapetype, extrudeBufferGeometry) {
				var image = new Image();
				image.src = newimgsrc;
				$(image).load(function() {
					
				console.log("loaded new image with source = " + newimgsrc); 
				var imgcanvas = document.getElementById('imagecanvas');
					var ctxt = imgcanvas.getContext('2d');
					
					ctxt.canvas.width = image.width;
					ctxt.canvas.height = image.height;
					ctxt.drawImage(image, 0, 0);

					var pixelData = ctxt.getImageData(0,0, ctxt.canvas.width, ctxt.canvas.height);
					ctxt.canvas.width = 0;

					ctxt.canvas.height = 0;
					ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
					var targetgeom = extrudeBufferGeometry(pixelData, shapetype, colors);
					var targetpos1 = targetgeom.attributes.position.array;
					var targetpos2 = positions; 
	
					var currpositions = [];
					for (var i = 0; i < targetpos1.length; i++) {
						currpositions[i] = positions[i];
					} 

					//console.log(targetpos);
					
					transformtween1 = new TWEEN.Tween(currpositions).to(targetpos1, 4000)
							  .delay(1000)
							  .yoyo(true)
							  .repeat(Infinity)
							  .easing(TWEEN.Easing.Cubic.In);
					transformtween1.onUpdate(function () {
						for (var i = 0; i < positions.length; i++) {
							if (i < targetpos1.length) {
								positions[i] = currpositions[i]; 
							}
						
						}

						buffergeom.attributes.position.needsUpdate = true;
					});

					transformtween1.start();

					transformtween2 = new TWEEN.Tween(currpositions).to(targetpos2, 4000)
							  .delay(6000)
							  .yoyo(true)
							  .repeat(Infinity)
							  .easing(TWEEN.Easing.Cubic.In);
					transformtween2.onUpdate(function() {
						for (var i = 0; i < positions.length; i++) {
							if (i < targetpos1.length) {
								positions[i] = currpositions[i]; 
							}
						
						}

						buffergeom.attributes.position.needsUpdate = true;
					});

					/*scene.remove(buffermesh);
					var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading, 
							vertexColors: THREE.VertexColors});	

					var newmesh = new THREE.Mesh(b, material);
					scene.add(newmesh);*/
				});
			}

			// grabs pixel data from image source
			ImageExtrusion.prototype.loadImageData = function(extrudeImage) {
				var image = new Image();
				image.src = this.imgsrc;
				var obj = this;
				$(image).load(function () {
					console.log("loaded");	
					var imgcanvas = document.getElementById('imagecanvas');
					var ctxt = imgcanvas.getContext('2d');
					
					ctxt.canvas.width = image.width;
					ctxt.canvas.height = image.height;
					ctxt.drawImage(image, 0, 0);

					imgdata = ctxt.getImageData(0,0, ctxt.canvas.width, ctxt.canvas.height);
					ctxt.canvas.width = 0;
					//var picdata = imgdata.data;

					// count how many pixels to draw there are 
					/*for (var i = 0; i < picdata.length; i+=4) {
						// check that this pixel is not white
						var color = rgbToHex(picdata[i], picdata[i+1], picdata[i+2], picdata[i+3]);
						if (color == 0) {
							numColoredPixels++;
						}
					}*/
					ctxt.canvas.height = 0;
					ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
					obj.extrudeImage();
				});	
			}
		

			ImageExtrusion.prototype.screenshot = function (imagename) {
				filename= imagename + ".png";
				var dataUrl = renderer.domElement.toDataURL(filename);
				return dataUrl;
			}		
	
			function animate() {
				requestAnimationFrame(animate);
				render();
			}

			function render() {
				if (tween) {
					TWEEN.update();
				}
				
				if (transformtween1) {
					TWEEN.update();
				}

				var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
				projector.unprojectVector( vector, camera );

				raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

				/*var intersects = raycaster.intersectObject( buffermesh );

				if ( intersects.length > 0 ) {

					var intersect = intersects[ 0 ];

					var object = intersect.object;
					var positions = object.geometry.attributes.position.array;
					for ( var i = 0, j = 0; i < 4; i ++, j += 3 ) {

						var index = intersect.indices[ i % 3 ] * 3;

						line.geometry.attributes.position.array[ j ] =   positions[ index ] ;
						line.geometry.attributes.position.array[ j + 1 ] = positions[ index + 1 ];
						line.geometry.attributes.position.array[ j + 2 ] = positions[ index + 2 ];
						line.geometry.attributes.position.array[ j + 3 ] = positions[ index + 3 ];

					}
					line.visible = true;
					line.geometry.attributes.position.needsUpdate = true;
				}
				else {
					line.visible = false;
				}*/


				renderer.render(scene, camera);
				frameCount++;
			}
		
				
