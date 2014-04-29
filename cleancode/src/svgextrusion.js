
/*
 * SVG Extrusion data visualization class
 * Author: Lauren Shapiro
 *
 */
var ThreeData = {VERSION: '1'};

ThreeData.SVGExtrusion = function(svg, opacity, tooltip, scene, camera) {
	this.svg = svg;
	this.opacity = opacity;

	if (this.opacity == undefined) {
		this.opacity = 0.6;
	}

	this.tooltip = tooltip;
	this.scene = scene;
	this.camera = camera;
	this.init();
}

ThreeData.SVGExtrusion.prototype.init = function() {
	var shapes = this.parsePaths();
	this.meshes = this.extrudeShapes(shapes);	

	for (var i = 0; i < this.meshes.length; i++) {
		this.scene.add(this.meshes[i]);
	}

	//this.positionCamera(this.meshes);	
}

	
ThreeData.SVGExtrusion.prototype.calculateCentroid = function(points) {
	//get x-z center
	var x_tot = 0;	
	var y_tot = 0;
	var z_tot = 0;
	for (var i = 0; i < points.length; i++) {
		x_tot += points[i].x;
		y_tot += points[i].y;
		z_tot += points[i].z;
	}	

	var x_avg = x_tot / points.length;
	var y_avg = y_tot / points.length;
	var z_avg = z_tot / points.length;
	var centroid = new THREE.Vector3(x_avg, y_avg, z_avg);	
	return centroid;
}

ThreeData.SVGExtrusion.prototype.getWorldPosition = function(mesh) {
	mesh.geometry.computeBoundingBox();
	var boundingBox = mesh.geometry.boundingBox;

	var position = new THREE.Vector3();
	position.subVectors( boundingBox.max, boundingBox.min );
	position.multiplyScalar( 0.5 );
	position.add( boundingBox.min );

	position.applyMatrix4(mesh.matrixWorld );
	return position;
}

ThreeData.SVGExtrusion.prototype.getCameraCenter = function() {
	if (this.avgCentroid == undefined) {
		this.positionCamera(this.meshes);
	}

	return this.avgCentroid;
}

ThreeData.SVGExtrusion.prototype.positionCamera = function(meshes) {
	this.avgCentroid = new THREE.Vector3(0,0,0);
	var numfaces = 0;
	var scenegeom = new THREE.Geometry();
	var numvertices = 0;

	for (var i = 0; i < meshes.length; i++) {
		var nextgeom = meshes[i].geometry;
		var position = this.getWorldPosition(meshes[i])
		this.avgCentroid.x += position.x;
		this.avgCentroid.y += position.y;
		this.avgCentroid.z += position.z;
	
		nextgeom.computeCentroids();	
		numfaces += nextgeom.faces.length;

		for (var j = 0; j < nextgeom.vertices.length; j++) {
			scenegeom.vertices.push(nextgeom.vertices[j]);
		}

		for (var j = 0; j < nextgeom.faces.length; j++) {
			var nextface = nextgeom.faces[j];
			var newface = new THREE.Face3();
			newface.a = nextface.a + numvertices;
			newface.b = nextface.b + numvertices;
			newface.c = nextface.c + numvertices;
			scenegeom.faces.push(newface);
		}
	}

	this.avgCentroid.x /= meshes.length;
	this.avgCentroid.y /= meshes.length;
	this.avgCentroid.z /= meshes.length;
	this.avgCentroid.y = 0;

	this.camera.lookAt(this.avgCentroid);

	scenegeom.computeBoundingSphere();
	var radius = scenegeom.boundingSphere.radius;
	this.camera.position.set(radius/2, radius, radius);
}

ThreeData.SVGExtrusion.prototype.extrudeShapes = function(shapes) {
	var meshes = [];
	for (var i = 0; i < shapes.length; i++) {
		var shape = shapes[i].shape;

		var color = shapes[i].color;
		var amount = 10 + Math.random() * 90;

		var extrudegeom = new THREE.ExtrudeGeometry(shape, {amount:amount, bevelEnabled:false});
		var extrudeMat = new THREE.MeshBasicMaterial({color:color, transparent:true, opacity:this.opacity});
		var extrudemesh = new THREE.Mesh(extrudegeom, extrudeMat);

		var rotmat = new THREE.Matrix4();
		rotmat.makeRotationX(Math.PI/2);
		extrudemesh.applyMatrix(rotmat);
		
		var centroid = this.calculateCentroid(extrudemesh.geometry.vertices);

		// translate to center
		var transmat = new THREE.Matrix4();
		transmat.makeTranslation(0, amount, -200);
		extrudemesh.applyMatrix(transmat);
		meshes.push(extrudemesh); 
	}

	return meshes;
}

ThreeData.SVGExtrusion.prototype.parsePaths = function(){
	var shapes = [];
	var paths = this.svg.find("path");

	for (var i = 0; i < paths.length; i++) {
		var nextpath = $(paths[i]).attr("d");
		var nextcolor = $(paths[i]).attr("fill");
		shapes.push({shape: this.transformSVGPath(nextpath), color:nextcolor});
	}	

	return shapes;
}



/*
 * very slightly adjusted transform method from: https://gist.github.com/gabrielflorit/3758456
 */
ThreeData.SVGExtrusion.prototype.transformSVGPath = function(pathStr) {
  var seenpoints = []; 
  const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
      MINUS = 45;
 
  var path = new THREE.Shape();
  
  var idx = 1, len = pathStr.length, activeCmd,
      x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
      x1 = 0, x2 = 0, y1 = 0, y2 = 0,
      rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
  
  function eatNum() {
    var sidx, c, isFloat = false, s;
    // eat delims
    while (idx < len) {
      c = pathStr.charCodeAt(idx);
      if (c !== COMMA && c !== SPACE)
        break;
      idx++;
    }
    if (c === MINUS)
      sidx = idx++;
    else
      sidx = idx;
    // eat number
    while (idx < len) {
      c = pathStr.charCodeAt(idx);
      if (DIGIT_0 <= c && c <= DIGIT_9) {
        idx++;
        continue;
      }
      else if (c === PERIOD) {
        idx++;
        isFloat = true;
        continue;
      }
      
      s = pathStr.substring(sidx, idx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }
    
    s = pathStr.substring(sidx);
    return isFloat ? parseFloat(s) : parseInt(s);
  }
  
  function contains(arr, pt) {
	for (var i = 0; i < arr.length; i++) {
		if (Math.abs(arr[i].x - pt.x) < 0.001 && 
		    Math.abs(arr[i].y - pt.y) < 0.001){
				return true;
		}
	}

	return false;
  }


  function nextIsNum() {
    var c;
    // do permanently eat any delims...
    while (idx < len) {
      c = pathStr.charCodeAt(idx);
      if (c !== COMMA && c !== SPACE)
        break;
      idx++;
    }
    c = pathStr.charCodeAt(idx);
    return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
  }
  
  var canRepeat;
  activeCmd = pathStr[0];
  while (idx <= len) {
    canRepeat = true;
    switch (activeCmd) {
        // moveto commands, become lineto's if repeated
      case 'M':
        x = eatNum();
        y = eatNum();
	if (contains(seenpoints, new THREE.Vector2(x, y)) == false) {
        	path.moveTo(x, y);
		seenpoints.push(new THREE.Vector2(x, y));
	}
        activeCmd = 'L';
        break;
      case 'm':
        x += eatNum();
        y += eatNum();
	if (contains(seenpoints, new THREE.Vector2(x, y)) == false) {
		path.moveTo(x, y);
		seenpoints.push(new THREE.Vector2(x, y));
	}
        activeCmd = 'l';
        break;
      case 'Z':
      case 'z':
        canRepeat = false;
        if (x !== firstX || y !== firstY)
          //path.lineTo(firstX, firstY); //can't close path because of extrude geometry
        break;
        // - lines!
      case 'L': 
      case 'H':
      case 'V':
        nx = (activeCmd === 'V') ? x : eatNum();
        ny = (activeCmd === 'H') ? y : eatNum();
	if (contains(seenpoints, new THREE.Vector2(nx, ny)) == false) {
		
        	path.lineTo(nx, ny);
		seenpoints.push(new THREE.Vector2(nx, ny));
	}
        x = nx;
        y = ny;
        break;
      case 'l':
      case 'h':
      case 'v':
        nx = (activeCmd === 'v') ? x : (x + eatNum());
        ny = (activeCmd === 'h') ? y : (y + eatNum());
	if (contains(seenpoints, new THREE.Vector2(nx, ny)) == false) {
		path.lineTo(nx, ny);
		seenpoints.push(new THREE.Vector2(nx, ny));
	}
        x = nx;
        y = ny;
        break;
        // - cubic bezier
      case 'C':
        x1 = eatNum(); y1 = eatNum();
      case 'S':
        if (activeCmd === 'S') {
          x1 = 2 * x - x2; y1 = 2 * y - y2;
        }
        x2 = eatNum();
        y2 = eatNum();
        nx = eatNum();
        ny = eatNum();
	path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx; y = ny;
        break;
      case 'c':
        x1 = x + eatNum();
        y1 = y + eatNum();
      case 's':
        if (activeCmd === 's') {
          x1 = 2 * x - x2;
          y1 = 2 * y - y2;
        }
        x2 = x + eatNum();
        y2 = y + eatNum();
        nx = x + eatNum();
        ny = y + eatNum();
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx; y = ny;
        break;
        // - quadratic bezier
      case 'Q':
        x1 = eatNum(); y1 = eatNum();
      case 'T':
        if (activeCmd === 'T') {
          x1 = 2 * x - x1;
          y1 = 2 * y - y1;
        }
        nx = eatNum();
        ny = eatNum();
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'q':
        x1 = x + eatNum();
        y1 = y + eatNum();
      case 't':
        if (activeCmd === 't') {
          x1 = 2 * x - x1;
          y1 = 2 * y - y1;
        }
        nx = x + eatNum();
        ny = y + eatNum();
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx; y = ny;
        break;
        // - elliptical arc
      case 'A':
        rx = eatNum();
        ry = eatNum();
        xar = eatNum() * Math.PI/180;
        laf = eatNum();
        sf = eatNum();
        nx = eatNum();
        ny = eatNum();
        if (rx !== ry) {
          console.warn("Forcing elliptical arc to be a circular one :(",
                       rx, ry);
        }
        // SVG implementation notes does all the math for us! woo!
        // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        // step1, using x1 as x1'
        x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
        y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
        // step 2, using x2 as cx'
        var norm = Math.sqrt(
          (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
          (rx*rx * y1*y1 + ry*ry * x1*x1));
        if (laf === sf)
          norm = -norm;
        x2 = norm * rx * y1 / ry;
        y2 = norm * -ry * x1 / rx;
        // step 3
        cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
        cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
        
        var u = new THREE.Vector2(1, 0),
            v = new THREE.Vector2((x1 - x2) / rx,
                                  (y1 - y2) / ry);
        var startAng = Math.acos(u.dot(v) / u.length() / v.length());
        if (u.x * v.y - u.y * v.x < 0)
          startAng = -startAng;
        
        // we can reuse 'v' from start angle as our 'u' for delta angle
        u.x = (-x1 - x2) / rx;
        u.y = (-y1 - y2) / ry;
        
        var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
        // This normalization ends up making our curves fail to triangulate...
        if (v.x * u.y - v.y * u.x < 0)
          deltaAng = -deltaAng;
        if (!sf && deltaAng > 0)
          deltaAng -= Math.PI * 2;
        if (sf && deltaAng < 0)
          deltaAng += Math.PI * 2;
        
        path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
        x = nx;
        y = ny;
        break;
      default:
	if (activeCmd !== " ") {
        	throw new Error("weird path command: " + activeCmd);
	}
    }
    if (firstX === null) {
      //firstX = x;
      //firstY = y;
    }
    // just reissue the command
    if (canRepeat && nextIsNum())
      continue;
    activeCmd = pathStr[idx++];
  }
  
  return path;
}
