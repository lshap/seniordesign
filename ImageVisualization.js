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
			var meshes = [];
			var numshapes = 0;
			
			// inputted fields
			var imgsrc;
			var data;
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
				/*for (var i = 0; i < 2000; i++) {
					this.data.push(Math.random() * 10);
				}*/

				this.colors = colors;	
				this.shapeType = shape;
				console.log("shape type = "+ this.shapeType);
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
				$(canvas).css('margin-top', '0px');

				renderer = new THREE.WebGLRenderer(canvas);
				renderer.setClearColor(0xffffff, 1);
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				camera.position.set(0, 50, 150);
				animate();
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
				for (var i = 0; i < imagedata.length; i+= 4) {
					var color = rgbToHex(imagedata[i], imagedata[i + 1], imagedata[i + 2], imagedata[i + 3]);
					
					if (color == 0) {
						var pix = i/4;
						var x =  pix % imgdata.width;
						var z = pix / imgdata.width;
						var height = Math.random() * 4;
				
						var colordecision = Math.floor(Math.random() * this.colors.length);
						var drawcolor = this.colors[colordecision];
	
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

						var cubemat = new THREE.MeshBasicMaterial({color : drawcolor});

						mesh = new THREE.Mesh(geom, cubemat);
						meshes.push(mesh);

						mesh.position.x = x - imgdata.width/2;
						mesh.position.z = z - imgdata.height/2;
						

						if (animated) {
							mesh.scale.y = 0.01;	
						}

						scene.add(mesh); 
						numshapes++;
					}
				}

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
					
					var imgcanvas = document.getElementById('imagecanvas');
					var ctxt = imgcanvas.getContext('2d');
					
					// count how many pixels to draw there are 
					/*ctxt.canvas.width = image.width;
					ctxt.canvas.height = image.height;
					ctxt.drawImage(image, 0, 0);
					var tempdata = (ctxt.getImageData(0, 0, ctxt.canvas.width, ctxt.canvas.height)).data;

					var currPoints = 0;
					for (var i = 0; i < tempdata.length; i+=4) {
						// check that this pixel is not white
						var color = rgbToHex(tempdata[i], tempdata[i+1], tempdata[i+2], tempdata[i+3]);
						if (color == 0) {
							currPoints ++;
						}
					}*/				

	
					// scale image to data point size
					/*console.log('currpoints = ' + currPoints);
					var scale = Math.sqrt(obj.data.length/currPoints);
					console.log('scale = ' + scale);

					var scaledWidth = (image.width * scale);						
					var scaledHeight = (image.height * scale);*/

					var scaledWidth = image.width;
					var scaledHeight = image.height;						

					ctxt.canvas.width = scaledWidth;
					ctxt.canvas.height = scaledHeight;

					ctxt.drawImage(image, 0, 0, scaledWidth, scaledHeight);				
					imgdata = ctxt.getImageData(0,0, scaledWidth, scaledHeight);
					
					ctxt.canvas.width = 0;
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
			
