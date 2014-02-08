
class ExtrudeForm {
PVector vertices[];


ExtrudeForm(int height, PVector [] shape, float randomStep) {
	vertices = new PVector[shape.length * height * 4];
	PVector [] lastShape = new PVector[shape.length];
	PVector [] currShape = new PVector[shape.length];
	
	// initialize lastShape to startShape
	for (int i = 0; i < shape.length; i++) {
		lastShape[i] = new PVector(shape[i].x, shape[i].y, shape[i].z);
	}

	int index = 0;

	// initialize vertices
	for (int i = 0; i < height; i++) {
		for (int j = 0; j < shape.length; j++) {
			PVector startVert = lastShape[j]; 
			int lastInd = (j + 1) % shape.length;
			PVector endVert = lastShape[lastInd]; 
			PVector startTop = new PVector(startVert.x + random(-randomStep, randomStep),
						       startVert.y + 4,
							startVert.z + random(-randomStep, randomStep));
			PVector endTop;	
			if (j < shape.length - 1) {
				endTop = new PVector(endVert.x + random(-randomStep, randomStep),
						       endVert.y + 4,
							endVert.z + random(-randomStep, randomStep));
			}
			else {
				endTop = currShape[0];
			}

			// add next quad to vertices
			vertices[index] = startVert;
			vertices[index + 1] = startTop;
			vertices[index + 2] = endTop;
			vertices[index + 3] = endVert;
			index += 4;		

			// keep track of added vertices	
			currShape[j] = startTop;
			currShape[j + 1] = endTop;				
		}
			
		// update last shape	
		for (int k = 0; k < shape.length; k++) {
			lastShape[k] = new PVector(currShape[k].x, currShape[k].y, currShape[k].z);
		}
	
	}	
}

void display() {
	noFill();
	stroke(0, 255, 0);

	beginShape(QUAD_STRIP);
	for (int i = 0; i < vertices.length; i++) {
		vertex(vertices[i].x, vertices[i].y, vertices[i].z);
	} 
	endShape();
}

}
