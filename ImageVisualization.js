/*
 * Creates a 3D extrusion of a given source image
 * NOTE: Requires Three.js, JQuery, and OrbitControls.js
 */

			var scene;
			var camera;
			var renderer;
			var frameCount = 0;
			var controls;
			var scale = 0;
			var imgdata;
			var compressedImgData;
			var numColoredPixels = 0;
			var meshes = [];
			var buffermesh;
			var buffergeom;
			var numshapes = 0;
			var cubeadded = false;
			
			// inputted fields
			var imgsrc;
			var data;
			var colorschoices;

			var positions;
			var normals;
			var colors;
			var shapeType;
			var animated;
	
			var ShapeType = {
				SQUARE: 0,
				CYLINDER: 1,
				CONE: 2
			};

			// constructor
			function ImageExtrusion(img, inputdata, colors, shape, animate) {
				this.imgsrc = img;
				// this.data = inputdata;
				this.data = [];
				for (var i = 0; i < 5000; i++) {
					this.data.push(Math.random() * 10);
				}

				this.colorchoices = colors;	
				this.shapeType = shape;
				this.animated = animate;	
			} 
	
			// init function: initializes image extrusion scene 
			ImageExtrusion.prototype.init = function() {
				this.loadImageData(this.extrudeImage);
					
				// initialize 3D scene
				scene = new THREE.Scene();
				
				var light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 0, 1 );
				scene.add( light );
			
				camera = new THREE.PerspectiveCamera( 75, 
									window.innerWidth / window.innerHeight,
									0.1,
									1000 );
				controls = new THREE.OrbitControls(camera);

				var canvas = document.getElementById('canvas'); 
				renderer = new THREE.WebGLRenderer(canvas);
				renderer.setClearColor(0xffffff, 1);
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				camera.position.set(0, 50, 150);

				// set up buffer geometry
				buffergeom = new THREE.BufferGeometry();	
				var triangles = 12 * this.data.length; // 12 triangles per cube
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
				
				positions = buffergeom.attributes.position.array;
				normals = buffergeom.attributes.normal.array;
				colors = buffergeom.attributes.color.array;
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
				
			ImageExtrusion.prototype.addMesh = function(i, geom) {
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

			function compressImage() {

			}

			// converts pixel data to a 3D scene
			ImageExtrusion.prototype.extrudeImage = function() {
				console.log(imgdata);
				var imagedata = imgdata.data;
				var ind = 0;
				for (var i = 0; i < imagedata.length; i+= 4) {
					var color = rgbToHex(imagedata[i], imagedata[i + 1], imagedata[i + 2], imagedata[i + 3]);
					
					if (color == 0) {
						var pix = i/4;
						var x =  pix % imgdata.width;
						var z = pix / imgdata.width;
						var height = Math.random() * 4;
				
						var colordecision = Math.floor(Math.random() * this.colorchoices.length);
						var drawcolor = this.colorchoices[colordecision];
	
						var mesh, geom, mat;
						// console.log("shape type = "+ this.shapeType);
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
							default:
								geom = new THREE.CubeGeometry(1, height, 1);
						}

						var translate = new THREE.Matrix4();
						translate.makeTranslation(x - imgdata.width/2, 0, z - imgdata.height/2);
						geom.applyMatrix(translate);
						this.addMesh(ind, geom);
						ind += geom.faces.length * 9;

						numshapes++;
					}
				}

				var material = new THREE.MeshBasicMaterial({color: 0xff0000});
				buffermesh = new THREE.Mesh(buffergeom, material);
				scene.add(buffermesh);

				console.log("drew " + numshapes + " shapes");
			}

			// grabs pixel data from image source
			ImageExtrusion.prototype.loadImageData = function(extrudeImage) {
				var image = new Image();
				console.log('trying to load image from source ' + this.imgsrc);
				image.src = this.imgsrc;
				var obj = this;
				$(image).load(function () {
					console.log("loaded");	
//					document.write("<canvas id=\"imagecanvas\"></canvas>")	
					var imgcanvas = document.getElementById('imagecanvas');
					var ctxt = imgcanvas.getContext('2d');
					
					ctxt.canvas.width = image.width;
					ctxt.canvas.height = image.height;
					ctxt.drawImage(image, 0, 0);

					// scale image to data point size
					/*console.log('currpoints = ' + currPoints);
					var scale = Math.sqrt(obj.data.length/currPoints);
					console.log('scale = ' + scale);

					var scaledWidth = (image.width * scale);						
					var scaledHeight = (image.height * scale);*/

					/*var scaledWidth = image.width/4;
					var scaledHeight = image.height/4;						

					ctxt.canvas.width = scaledWidth;
					ctxt.canvas.height = scaledHeight;

					ctxt.drawImage(image, 0, 0, scaledWidth, scaledHeight);	*/

					imgdata = ctxt.getImageData(0,0, ctxt.canvas.width, ctxt.canvas.height);
					ctxt.canvas.width = 0;
					var picdata = imgdata.data;

					// count how many pixels to draw there are 
					for (var i = 0; i < picdata.length; i+=4) {
						// check that this pixel is not white
						var color = rgbToHex(picdata[i], picdata[i+1], picdata[i+2], picdata[i+3]);
						if (color == 0) {
							numColoredPixels ++;
						}
					}				

					ctxt.canvas.height = 0;
					ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
					obj.extrudeImage();
				});	
			}
		
			
			function animate() {
				requestAnimationFrame(animate);
				render();
			}

			function render() {
				
				// gradually scale shapes along y axis if animation is specified
				if (animated && scale < 100) {
					for (var m = 0; m < meshes.length; m ++) {
						var mesh = meshes[m];
						mesh.scale.y += 0.01;
					}				
					scale ++;
				}

				renderer.render(scene, camera);
				frameCount++;
			}
			
