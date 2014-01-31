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
float theta = 0;
float phi = 0;
float alpha = 0;

float angle1 = -PI/2;
float angle2 = 0;

// mouse position
float oldMouseX;
float oldMouseY;

void setup() {
  size(width, height, P3D);
  background(0);
}

void mousePressed() {
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

void mouseDragged() {
	rotateCamera(mouseX - oldMouseX, mouseY - oldMouseY);
	oldMouseX = mouseX;
	oldMouseY = mouseY;	
}


void mouseWheel(MouseEvent e) {
	console.log("amount", e.getAmount());
}

void draw() {
	camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);
	background(0);
	pushMatrix();
	
	noFill();
	stroke(255);
	box(100);
	popMatrix();

}
