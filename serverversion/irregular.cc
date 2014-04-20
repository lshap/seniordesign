// Irregular packing example code
//
// Author   : Chris H. Rycroft (LBL / UC Berkeley)
// Email    : chr@alum.mit.edu
// Date     : August 30th 2011
#include <iostream> 
#include <vector>
#include <fstream>
#include "voro++.hh"
using namespace voro;
using namespace std;

// Set up constants for the container geometry
/*const double x_min=-6,x_max=6;
const double y_min=-6,y_max=6;
const double z_min=-3,z_max=9;*/

// Golden ratio constants
const double Phi=0.5*(1+sqrt(5.0));
const double phi=0.5*(1-sqrt(5.0));

// Set up the number of blocks that the container is divided
// into.
const int n_x=5,n_y=5,n_z=5;

// Create a wall class that, whenever called, will replace the Voronoi cell
// with a prescribed shape, in this case a dodecahedron
class wall_initial_shape : public wall {
        public:
                wall_initial_shape() {

                        // Create a dodecahedron
                        v.init(-2,2,-2,2,-2,2);
                        v.plane(0,Phi,1);v.plane(0,-Phi,1);v.plane(0,Phi,-1);
                        v.plane(0,-Phi,-1);v.plane(1,0,Phi);v.plane(-1,0,Phi);
                        v.plane(1,0,-Phi);v.plane(-1,0,-Phi);v.plane(Phi,1,0);
                        v.plane(-Phi,1,0);v.plane(Phi,-1,0);v.plane(-Phi,-1,0);
                };
                bool point_inside(double x,double y,double z) {return true;}
                bool cut_cell(voronoicell &c,double x,double y,double z) {

                        // Set the cell to be equal to the dodecahedron
                        c=v;
                        return true;
                }
                bool cut_cell(voronoicell_neighbor &c,double x,double y,double z) {

                        // Set the cell to be equal to the dodecahedron
                        c=v;
                        return true;
                }
        private:
                voronoicell v;
};

int main() {

       // Create a container with the geometry given above. This is bigger
       // than the particle packing itself.
       ifstream particlefile("particles_from_server");
       string line;
       double x_min = numeric_limits<double>::max();
       double x_max = numeric_limits<double>::min();
       double y_min = numeric_limits<double>::max();
       double y_max = numeric_limits<double>::min();
       double z_min = numeric_limits<double>::max();
       double z_max = numeric_limits<double>::min();

       if (particlefile.is_open()) {
      	while(getline(particlefile,line)) {
		char* line_chr = new char[line.length() + 1];
		strcpy(line_chr, line.c_str());
		char* nums = strtok(line_chr, " ");
		int index = 0;
		while (nums != NULL) {
			//cout << nums<< endl;
			double val = atof(nums);
			if (index == 1) { // x value
				if (val > x_max) {
					x_max = val;
				}
				if (val < x_min) {
					x_min = val;
				}
			}
			else if (index == 2) { // y value
				if (val > y_max) {
					y_max = val;
				}
				if (val < y_min) {
					y_min = val;
				}
			}
			else if (index == 3) { // z value
				if (val > z_max) {
					z_max = val;
				}
				if (val < z_min) {
					z_min = val;
				}
			}

			nums = strtok(NULL, " ");
			index ++;
		}
      	}
	
       	particlefile.close();
	x_min--;
	x_max++;
	y_min--;
	y_max ++;
	z_min--;
	z_max++;

	/*cout  << "xmin " << x_min << endl;
	cout  << "xmax " << x_max << endl;
	cout  << "ymin " << y_min << endl;
	cout  << "ymax " << y_max << endl;
	cout  << "zmin " << z_min << endl;
	cout  << "zmax " << z_max << endl;*/
        }

        container con(x_min,x_max,y_min,y_max,z_min,z_max,n_x,n_y,n_z,
                        false,false,false,8);

        // Create the "initial shape" wall class and add it to the container
        wall_initial_shape(wis);
        con.add_wall(wis);

        // Import the irregular particle packing
           con.import("particles_from_server");
           con.print_custom("new THREE.Vector3(%x, %y, %z)\n%P\n%t\n%l\n\n", stdout);
}
