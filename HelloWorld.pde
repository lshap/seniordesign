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
float [] x = new float[8];
float [] y = new float[8];
float [] z = new float[8];
float formCenterX = 0;
float formCenterY = 0; 
float formCenterZ = 0;
float formResolution = 8;

void setup() {
  size(width, height, P3D);
  background(0);

  float startRadius = 50;
  float angle = radians(360/float(formResolution));
  
  for (int i = 0; i < formResolution; i++) {
	x[i] = cos(angle * i) * startRadius;		
	y[i] = 0; 		
	z[i] = sin(angle * i) * startRadius;		

	}	
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
	for (int k = 0; k < height; k++) {
		for (int i = 0; i < formResolution; i++) {
			x[i] += random(-stepSize, stepSize);
			y[i]+= 4;
			z[i] += random(-stepSize, stepSize);
		}		

		beginShape();
		curveVertex(x[formResolution - 1] + formCenterX,
			    y[formResolution - 1] + formCenterY, 
			    z[formResolution - 1] + formCenterZ); 
		for (int i = 0; i < formResolution; i ++) {
			curveVertex(x[i] + formCenterX,
				    y[i] + formCenterY, 
				    z[i] + formCenterZ); 
		} 
		
		curveVertex(x[0] + formCenterX,	y[0] + formCenterY, z[0] + formCenterZ); 
		curveVertex(x[1] + formCenterX,	y[1] + formCenterY, z[1] + formCenterZ); 
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
	noLoop();

}
