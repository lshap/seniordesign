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
float formResolution = 8;
float startRadius = 50;
boolean drawn = false;

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

void drawExtrudeForm(int height) {
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
	for (int k = 0; k < height; k++) {
		beginShape();
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
		endShape();
	}
	
}

void draw() {
	camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);

	background(0);
	pushMatrix();
	
	noFill();
	stroke(255);
//	box(100);
	drawExtrudeForm(50);
	popMatrix();
}
