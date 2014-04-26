/*
 * accepts 2 THREE.Shape objects as arguments 
 */ 
ShapeClipper = function (shape, clip) {
	this.shape = shape;
	this.clip = clip;
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
	
	var shapeverts = (new THREE.ShapeGeometry(this.shape)).vertices;
	var clipverts = (new THREE.ShapeGeometry(this.clip)).vertices;
	
	var curr = new node();
	var head;
	var last = null;
	curr.prev = last;

	// initialize linked list to hold first shape
	for (var i = 0; i < shapeverts.length; i++) {
		curr.x = shapeverts[i].x;
		curr.y = shapeverts[i].y;
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
	var close = new node();
	close.x = head.x;
	close.y = head.y;
	last.next = close;
	close.prev = last;

	function printlist(start) {
		var curr = start;
		while (curr != null) {
			console.log("curr : " + curr.x + " , " + curr.y); 
			var prevtext = (curr.prev == null) ? "null" : curr.prev.x + " , " + curr.prev.y;
			var nexttext = (curr.next == null) ? "null" : curr.next.x + " , " + curr.next.y;
			console.log("prev " + prevtext);
			console.log("next " + nexttext);
			console.log("\n");
			curr = curr.next;
		}
	}

	var cliphead = new node();	
	close.nextPoly = cliphead;	

	curr = cliphead;
	var cliplast = null;

	for (var i = 0; i < clipverts.length; i++) {
		curr.x = clipverts[i].x;
		curr.y = clipverts[i].y;
		curr.prev = cliplast;			

		// make a new node for the next vertex
		var next = new node();
		curr.next = next;

		// set last = to curr
		cliplast = curr;
		curr = next;		
	}
	
	// add new node to end
	var clipclose = new node();
	clipclose.x = cliphead.x;
	clipclose.y = cliphead.y;
	clipclose.prev = cliplast;
	cliplast.next = clipclose;

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


	function intersect(p1, p2, q1, q2) {
		var pt = null;
		var v1 = new THREE.Vector2(p1.x - q1.x, p1.y - q1.y); // p1 - q1
		var v2 = new THREE.Vector2(-(q2.y - q1.y), q2.x - q1.x); // orth complement (q2 - q1)

		var w_p1 = v1.dot(v2);
		var v3 = new THREE.Vector2(p2.x - q1.x, p2.y - q1.y); // p2 - q1
		var w_p2 = v3.dot(v2);

		if (w_p1 * w_p2 <= 0) {
			v1 = new THREE.Vector2(q1.x - p1.x, q1.y - p1.y); // q1 - p1
			v2 = new THREE.Vector2(-(p2.y - p1.y), p2.x - p1.x); // orth comp (p2 - p1)
			v3 = new THREE.Vector2(q2.x - p1.x, q2.y - p1.y); // q2 - p1
			var w_q1 = v1.dot(v2);
			var w_q2 = v3.dot(v2);

			if ( w_q1 * w_q2 <=0 ) {
				var alpha_p = w_p1/(w_p1 - w_p2);
				var ptVec = new THREE.Vector2(p1.x, p1.y);
				var dirVec = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);
				var x = ptVec.x + alpha_p * dirVec.x;
				var y = ptVec.y + alpha_p * dirVec.y;
				pt = {x: x, y:y};
			}
		}

		return pt;	
	}

	// PHASE ONE: loop through each shape and find intersections
	var shapecurr = head;
	while (shapecurr.next != null) {
		var clipcurr = cliphead;
		while (clipcurr.next != null) {
			var intersection = intersect(shapecurr, shapecurr.next, clipcurr, clipcurr.next);
			if (intersection != null) {
				var i1 = createvertex(shapecurr, shapecurr.next, intersection);
				var i2 = createvertex(clipcurr, clipcurr.next, intersection);
				i1.neighbor = i2;
				i2.neighbor = i1;
			}

			clipcurr = clipcurr.next;
		}
	
		shapecurr = shapecurr.next;
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
		while (c.next != null) {
			var point = {x: c.x, y: c.y};
			if (pointInPoly(point, othershape)) {
				c.exit = true;
				exitstatus = true;
			}
			
			var s = head;
			while (s.next != null) {
				if (s.intersect == true) {
					s.exit = exitstatus;
					exitstatus = !exitstatus;
				}

				s = s.next;
			}	

			c = c.next;
		}
	}


	// PHASE TWO: toggle entry/exit status
	markEntryStatus(head, clipverts);
	markEntryStatus(cliphead, shapeverts);


	// PHASE THREE:
	// find all intersection nodes
	var intersections = [];
	curr = head;
	while (curr != null) {
		if (curr.intersect == true) {
			intersections.push(curr);
		}
		curr = curr.next;
	}


	// set curr to point to head of intersection list
	var polygons = [];
	for (var i = 0; i < intersections.length; i++) {
		var curr = intersections[i];
		var newpoly = [];
		newpoly.push(new THREE.Vector2(curr.x, curr.y));

		var start = curr;
		var closed = false;

		while (closed == false) {
			if (curr.exit == false) {
				while (curr.intersect == false) {
					curr = curr.next;
					if (curr.x == start.x && curr.y == start.y) {
						closed = true;
					}
					else {
						newpoly.push[curr];
					}
				}
			}
			else {
				while (curr.intersect == false) {
					curr = curr.prev;
					if (curr.x == start.x && curr.y == start.y) {
						closed = true;
					}
					else {
						newpoly.push[curr];
					}
				}
			}

			curr = curr.neighbor;
		}	

		polygons.push(newpoly);
	}


	// polygons should contain vertices of polygons	
	/*var shapes = [];
	for (var i = 0; i < polygons.length; i++) {
		var shape = new Shape(polygons[i]);
	}

	return shapes;*/
	return polygons;
}


