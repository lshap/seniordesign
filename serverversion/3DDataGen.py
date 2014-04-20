import random
file = open("particles.txt", "w")
minval = -1
maxval = 1
for i in range (0,50):
	x = minval + random.random()*(maxval - minval)
	y = minval + random.random()*(maxval - minval)
	z = minval + random.random()*(maxval - minval)
	line = '{:d} {:f} {:f} {:f}\n'.format((i+1), x, y, z)
	file.write(line)
file.close()
