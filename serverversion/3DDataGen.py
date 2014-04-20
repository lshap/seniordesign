import random
file = open("particles.txt", "w")
for i in range (0,500):
	x = random.random()
	y = random.random()
	z = random.random()
	line = '{:d} {:f} {:f} {:f}\n'.format((i+1), x, y, z)
	file.write(line)
file.close()
