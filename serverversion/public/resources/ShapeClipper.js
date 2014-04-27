/*
 * accepts 2 THREE.Shape objects as arguments 
 */ 
ShapeClipper = function (shape, clip) {
	this.shapeverts = shape;
	this.clipverts = clip;
}

ShapeClipper.prototype.getClippedShapes = function () {
	var node = function (){
		this.x = 0;
		this.y = 0;
		this.next = null;
		this.prev = null;
		this.nextPoly = null;
		this.intersect = false;
		this.exit = false;
		this.neighbor = null;
		this.alpha = 0;
	}	
	
	
	var curr = new node();
	var head;
	var last = null;
	curr.prev = last;

	// initialize linked list to hold first shape
	for (var i = 0; i < this.shapeverts.length; i++) {
		curr.x = this.shapeverts[i].x;
		curr.y = this.shapeverts[i].y;
		curr.prev = last;			

		if (i == 0) {
			head = curr;
		}

		// make a new node for the next vertex
		var next = new node();
		curr.next = next;

		// set last = to curr
		last = curr;
		curr = next;		
	}

	// curr points to last node in shape 
	/*var close = new node();
	close.x = head.x;
	close.y = head.y;
	last.next = close;
	close.prev = last;*/

	last.next = head;
	head.prev = last;



	function printlist(start) {
		var curr = start;
		var backToStart = false;
		while (backToStart == false) {
			console.log("curr : " + curr.x + " , " + curr.y); 
			var prevtext = (curr.prev == null) ? "null" : curr.prev.x + " , " + curr.prev.y;
			var nexttext = (curr.next == null) ? "null" : curr.next.x + " , " + curr.next.y;
			console.log("prev " + prevtext);
			console.log("next " + nexttext);
			console.log("exit " + curr.exit);
			console.log("intersect " + curr.intersect);
			console.log("\n");
			curr = curr.next;

			if (curr.x == start.x && curr.y == start.y) {
				backToStart = true;
			}
		}
	}

	var cliphead = new node();	
	close.nextPoly = cliphead;	

	curr = cliphead;
	var cliplast = null;

	for (var i = 0; i < this.clipverts.length; i++) {
		curr.x = this.clipverts[i].x;
		curr.y = this.clipverts[i].y;
		curr.prev = cliplast;			

		// make a new node for the next vertex
		var next = new node();
		curr.next = next;

		// set last = to curr
		cliplast = curr;
		curr = next;		
	}
	
	// add new node to end
	/*var clipclose = new node();
	clipclose.x = cliphead.x;
	clipclose.y = cliphead.y;
	clipclose.prev = cliplast;
	cliplast.next = clipclose;*/
	cliplast.next = cliphead;
	cliphead.prev = cliplast;
	

	function createvertex(s1, s2, point) {
		var newnode = new node();
		newnode.intersect = true;

		newnode.prev = s1;
		newnode.next = s2;

		s1.next = newnode;
		s2.prev = newnode;

		newnode.x = point.x; 
		newnode.y = point.y; 
		return newnode;
	}

	function cross(v1, v2) {
		var cross = v1.x * v2.y - v1.y * v2.x;
		return cross;
	}


	function intersect(p1, p2, q1, q2) {
		var point = null;
		var p = new THREE.Vector2(p1.x, p1.y)	
		var r = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);	

		var q = new THREE.Vector2(q1.x, q1.y)	
		var s = new THREE.Vector2(q2.x - q1.x, q2.y - q1.y);	
		var qSubp = new THREE.Vector2();
		var pSubq = new THREE.Vector2();

		qSubp.subVectors(q, p);	
		pSubq.subVectors(p, q);	
		var rXs = cross(r, s);
		if (rXs == 0) {
			if (cross(qSubp, r) == 0) { // colinear
				// overlapping
				if (0 <= r.dot(qSubp) || 
				    0 <= s.dot(pSubq) && s.dot(pSubq) <= s.dot(s)) {
					console.log("colinear do something!");
					/*console.log("p1 = " + p1.x + " , " + p1.y);
					console.log("p2 = " + p2.x + " , " + p2.y);

					console.log("q1 = " + q1.x + " , " + q1.y);
					console.log("q2 = " + q2.x + " , " + q2.y);*/

				}
				else { // disjoint
					return point;	
				}	
			}
			else { // parallel 
				return point;
			}
		}
		else {
	
			var t = cross(qSubp, s) / rXs;
			var u = cross(qSubp, r) / rXs;
			if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
				var x = p.x + t * r.x;
				var y = p.y + t * r.y;
				point = {x: x, y:y};
			}
		}

		return point;
	}
	

	// PHASE ONE: loop through each shape and find intersections

	var s1 = head;
	var s2 = head.next;
	var count = 0;
	var shapevertslength = this.shapeverts.length;
	console.log("shapeverts = " + shapevertslength);

	var clipvertslength = this.clipverts.length;
	console.log("clipverts = " + clipvertslength);

	for (var i = 0; i < shapevertslength; i++) {
		var c1 = cliphead;
		var c2 = cliphead.next;

		var numshifts = 1;

		for (var j = 0; j < clipvertslength; j++) {
			/*count ++;
			console.log("comparing (" + s1.x + "," + s1.y + ") to (" + 
					s2.x + "," + s2.y + ") with (" + 
					c1.x + "," + c1.y + ") to (" + 
					c2.x + "," + c2.y + ")") ;
			console.log("\n");*/

			var intersection = intersect(s1, s2, c1, c2);
			if (intersection != null) {
				var i1 = createvertex(s1, s2, intersection);
				var i2 = createvertex(c1, c2, intersection);

				c1 = c1.next;
				numshifts ++;

				i1.neighbor = i2;
				i2.neighbor = i1;
			}

			c1 = c1.next;
			while (c1.intersect == true) {
				c1 = c1.next;
			}

			c2 = c1.next;
			while (c2.intersect == true) {
				c2 = c2.next;
			}
		}

		for (var k = 0; k < numshifts; k++) {
			s1 = s1.next;
		}

		s2 = s1.next;
	 }

	function pointInPoly(pt, poly) { 
		for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
			&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
			&& (c = !c);
			return c;
	}


	function markEntryStatus(start, othershape) {
		var c = start;
		var exitstatus = false;

		var p0 = {x: c.x, y: c.y};
		if (pointInPoly(p0, othershape)) {
			c.exit = true;
			exitstatus = true;
		}
		
		var s = start;
		var backToStart = false;
		while (backToStart == false) {
			if (s.intersect == true) {
				s.exit = exitstatus;
				exitstatus = !exitstatus;
			}

			s = s.next;

			if (s.x == start.x && s.y == start.y) {
				backToStart = true;
			}
		}	

	}


	// PHASE TWO: toggle entry/exit status
	markEntryStatus(head, this.clipverts);
	markEntryStatus(cliphead, this.shapeverts);

	// PHASE THREE:
	// find all intersection nodes
	var intersections = [];
	curr = head;
	var backToHead = false;
	while (backToHead == false) {
		if (curr.intersect == true) {
			intersections.push(curr);
		}

		curr = curr.next;
		if (curr.x == head.x && curr.y == head.y) {
			backToHead = true;
		}
	}


	// set curr to point to head of intersection list
	var polygons = [];
	var markedInters = [];
	for (var i = 0; i < intersections.length; i++) {
		markedInters.push(false);
	}


	if (intersections.length > 0) {
		var curr = intersections[0];
		markedInters[0] = true;
		console.log(intersections);
	}

	else { // no intersections
		curr = null;
		var allInside = true;
		var start = head;
		for (var i = 0; i < this.shapeverts.length; i++) {
			var pt = {x: start.x, y:start.y};
			if (pointInPoly(pt, this.clipverts) == false) {
				allInside = false;
				break;
			}	

			start = start.next;
		}

		var shapes = [];	
		if (allInside) {
			shapes.push(new THREE.Shape(this.shapeverts));		
		}

		return shapes;
	}


	while (curr != null) {
		var newpoly = [];
		newpoly.push(new THREE.Vector2(curr.x, curr.y));

		var start = curr;
		var closed = false;

		while (closed == false) {
			if (curr.exit == false) {
				var newintersect = false;

				while (newintersect == false) {
					curr = curr.next;
					if (curr.x == start.x && curr.y == start.y) {
						closed = true;
					}
					else { // don't close the shape for extrude geom
						newpoly.push(new THREE.Vector2(curr.x, curr.y));
						//console.log("added " + curr.x + " , " + curr.y);
					}

					if (curr.intersect == true) {
						newintersect = true;
						for (var i = 0; i < intersections.length; i++) {
							var inter = intersections[i];
							if (inter.x == curr.x && inter.y == curr.y) {
								markedInters[i] = true;
								break;
							}
						}
					}
				}
			}
			else {
				var newintersect = false;
				while (newintersect == false) {
					curr = curr.prev;
					if (curr.x == start.x && curr.y == start.y) {
						closed = true;
					}
					else { // don't close the shape for extrude geom
						newpoly.push(new THREE.Vector2(curr.x, curr.y));
						//console.log("added " + curr.x + " , " + curr.y);
					}

					if (curr.intersect == true) {
						newintersect = true;
						for (var i = 0; i < intersections.length; i++) {
							var inter = intersections[i];
							if (inter.x == curr.x && inter.y == curr.y) {
								markedInters[i] = true;
								break;
								}
							}
						}
					}
				}

				curr = curr.neighbor;

			}

			curr = null;
			for (var i = 0; i < markedInters.length; i++) {
				if (markedInters[i] == false) {
					curr = intersections[i];
					markedInters[i] = true;
				}
			}
			
			polygons.push(newpoly);
		} 


	// polygons should contain vertices of polygons	
	var shapes = [];
	for (var i = 0; i < polygons.length; i++) {
		var shape = new THREE.Shape(polygons[i]);
		shapes.push(shape);
	}

	return shapes;
}


