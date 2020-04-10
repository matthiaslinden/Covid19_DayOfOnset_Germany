#!/usr/bin/env python3.7
#coding:utf-8

f = open("ByDate/200410.csv","r")
lines = f.readlines()
f.close()

def nextDay(m,d):
	days = {1:31,2:29,3:31,4:30}
	d += 1 
	if days[m] < d:
		d = 1
		m += 1
	return m,d


# si,sm = "",""
# j = 0
# startat = (2,27,)
# m,d = startat
# p0 = 0
# for line in lines[1:]:
# 	bar,data, = line[:-1].split(",")
# 	p = int(data)
# 	if j%2 == 1:
# 		print(m,d,p0,p-p0)
# 		dt = 200000+m*100+d
# 		si += "%d:%d,"%(dt,p0)
# 		sm += "%d:%d,"%(dt,p-p0)
# 		m,d = nextDay(m,d)
# 	p0 = p
# 	j += 1
#
# print(si)
# print(sm)


si,sm = "",""
j = 0
startat = (3,4,)
m,d = startat
p0 = 0
for line in lines:
	bar,data, = line[:-1].split(",")
	p = int(data)
	if j%2 == 1:
		print(m,d,p0,p-p0)
		dt = 200000+m*100+d
		si += "%d:%d,"%(dt,p0)
		sm += "%d:%d,"%(dt,p-p0)
		m,d = nextDay(m,d)
	p0 = p
	j += 1

print(si)
print(sm)