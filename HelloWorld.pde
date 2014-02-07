// Processing code
int width = 500;
int height = 500;

// camera controls
float eyeX = 0;
float eyeY = 0; 
float eyeZ = (height/2)/tan(PI*30/180);
float centerX = 0;
float centerY = 0;
float centerZ = 0;

float r = (height/2)/tan(PI*30/180);

float angle1 = -PI/2;
float angle2 = 0;

// mouse position
float oldMouseX;
float oldMouseY;

// generated form
float [][] x; 
float [][] y;
float [][] z;
float formCenterX = 0;
float formCenterY = 0; 
float formCenterZ = 0;
boolean drawn = false;
ExtrudeForm ext;

$(document).ready(function(){
	$("#canvas").bind('mousewheel', function(e){
	e.preventDefault();
        if(e.originalEvent.wheelDelta /120 > 0) {
		r -= 40;
		rotateCamera(0,0);
        }
        else{
		r += 40;
		rotateCamera(0,0);

        }
    });
});

void setup() {
  size(width, height, P3D);
  background(0);
}

void mousePressed() {
	oldMouseX = mouseX;
	oldMouseY = mouseY;
}

void mouseDragged() {
	rotateCamera(mouseX - oldMouseX, mouseY - oldMouseY);
	oldMouseX = mouseX;
	oldMouseY = mouseY;	
}

void rotateCamera(float x, float y) {
	float gain = 40;
	angle1 += gain * (x * PI/180)/width;
	angle2 += gain * (-y * PI/180)/height;
	angle2 %= PI/2;

	float t = r * cos(angle2);
	eyeY = r * sin(angle2);
	eyeX = t * cos(angle1);
	eyeZ = t * sin(angle1);
}

void drawExtrudeForm(int formResolution, int startRadius, int height) {
	float stepSize = 5;
	fill(100);
	
	// set mesh points if it hasn't been drawn
	if (!drawn) {
		x = new float[height][8];
		y = new float[height][8];
		z = new float[height][8];

		// setup the original form
		float angle = radians(360/float(formResolution));

		for (int i = 0; i < formResolution; i++) {
			x[0][i] = cos(angle * i) * startRadius;
			y[0][i] = 0;
			z[0][i] = sin(angle * i) * startRadius; 
		}

		// randomly jitter points on 2D form as shape is extruded out
		for (int k = 1; k < height; k++) {
			for (int i = 0; i < formResolution; i++) {
				x[k][i] = x[k-1][i] + random(-stepSize, stepSize);
				y[k][i] = y[k-1][i] + 4;  		
				z[k][i] = z[k-1][i] + random(-stepSize, stepSize);
			}	
		}
		
		drawn = true;
	}


	// draw mesh
	fill(0, 255, 0);
	stroke(255, 0, 0);

	beginShape();
/*	for (int k = 0; k < height; k++) {
		// beginShape();
		curveVertex(x[k][formResolution - 1] + formCenterX,
		y[k][formResolution - 1] + formCenterY, 
		z[k][formResolution - 1] + formCenterZ); 

		for (int i = 0; i < formResolution; i ++) {
			curveVertex(x[k][i] + formCenterX,
			y[k][i] + formCenterY, 
			z[k][i] + formCenterZ); 
		} 
		
		curveVertex(x[k][0] + formCenterX, y[k][0] + formCenterY, z[k][0] + formCenterZ); 
		curveVertex(x[k][1] + formCenterX, y[k][1] + formCenterY, z[k][1] + formCenterZ); 
//		endShape();
	}*/

	shininess(1.0);
	scale(100);
	  vertex(-1, -1, -1);
 	 vertex( 1, -1, -1);
 	 vertex( 0,  0,  1);

 	 vertex( 1, -1, -1);
 	 vertex( 1,  1, -1);
  	vertex( 0,  0,  1);

 	 vertex( 1, 1, -1);
 	 vertex(-1, 1, -1);
 	 vertex( 0, 0,  1);

 	 vertex(-1,  1, -1);
 	 vertex(-1, -1, -1);
 	 curveVertex( 0,  0,  1);

	endShape();

}

void draw() {
	camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);

	background(0);
	pushMatrix();
	
//	box(100);
	drawExtrudeForm(8, 50, 50);

	int shapeSize = 50;
	PVector [] s = new PVector[shapeSize];
	float angle = radians(360/float(shapeSize));

	for (int i = 0; i < shapeSize; i++) {
			s[i] = new PVector(cos(angle * i) * 50, 0, sin(angle * i) * 50); 
	}


	if (!ext) {
 	ext = new ExtrudeForm(50, s, 5);
	}
	// ext.display();

	popMatrix();
}


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
			PVector startTop = new PVector(startVert.x,
 						       startVert.y + 4,
							startVert.z);
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
