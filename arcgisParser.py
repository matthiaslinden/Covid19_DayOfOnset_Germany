#!/usr/bin/env python3.7
#coding:utf-8

import datetime
import time
import pickle
import os
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from matplotlib import rc
rc('font',**{'family':'sans-serif','sans-serif':['Helvetica']})
rc('text', usetex=True)

from GenByDateOfOnset import ByDateOfOnset


class ArcgisSource(object):
	def __init__(self,d="arcgisData"):
		self.refdate = datetime.date(2020,1,1)
		self.firstdate = datetime.date(2020,2,16)
		self.nfirst = (self.firstdate-self.refdate).days
		print(self.refdate)
		
		self.Landkreise = {}
		self.Bundeslander = {}
		
		self.dsk,self.dsuk = {},{}
		
		self.datasets = {}
		self.openTemp()
		self.parseFiles(d)
		
	
		
	
	def openTemp(self,fn="arcgisData/arcgis.tmp"):
		try:
			t0 = time.time()
			f = open(fn,"rb")
			self.datasets = pickle.load(f)
			f.close()
			t1 = time.time()
			print("Opend from previous run in %.3f s"%(t1-t0))
		except:
			self.datasets = {}
			
	def dumpTemp(self,fn="arcgisData/arcgis.tmp"):
		f = open(fn,"wb+")
		pickle.dump(self.datasets,f)
		f.close()
		
	
	def parseFiles(self,d):
		nc = 0
		for fn in sorted([x for x in os.listdir(d) if x[-4:] == ".csv" and x[:-10] == "RKI_COVID19_"]):
			date = self.toDatetime(int(fn[-10:-4]))
			if date not in self.datasets.keys():
				self.parseFile(d+"/"+fn,date)
				nc += 1
		if nc > 0:
			self.dumpTemp()
	
	def parseFile(self,fn,date):
		# Import RKI arcgis Database download
		t0 = time.time()
		df = pd.read_csv(fn, sep=",") 
		
		def rdate(s):
			if "T" in s:
				return datetime.datetime.strptime(s.split("T")[0],"%Y-%m-%d")
			if "-" in s:
				return datetime.datetime.strptime(s.split(" ")[0],"%Y-%m-%d")
				 
			else:
				if s[:4] == "2020":
					return datetime.datetime.strptime(s.split(" ")[0],"%Y/%m/%d")
				else:
					return datetime.datetime.strptime(s.split(" ")[0],"%m/%d/%Y")
		
		df.rename(columns={ "Landkreis ID":"IdLandkreis",  "Neuer Fall":"NeuerFall", "Neuer Todesfall":"NeuerTodesfall", "Referenzdatum":"Refdatum",  "Neu Genesen":"NeuGenesen", "Anzahl Genesen":"AnzahlGenesen","Anzahl Fall":"AnzahlFall"},inplace=True)
		dfid = df.filter(items=["IdLandkreis","Landkreis","IdBundesland","Bundesland"],axis=1)

		if 1:
#		if date != datetime.date(2020,4,27):
			for i,l in dfid.iterrows():
				ilk,lk = l[0],l[1]
				ibl,bl = l[2],l[3]
				
				slk,sbl = self.Landkreise.get(ilk,None),self.Bundeslander.get(ibl,None)
				if slk == None:
					self.Landkreise[ilk] = lk
					slk = self.Landkreise[ilk]
				if slk != lk:
					print("Missmatched Landkreis",slk,lk,ilk)
					
				if sbl == None:
					self.Bundeslander[ibl] = bl
					sbl = bl
				if sbl != bl:
					print("Missmatched Bundesland",blk,bl,ibl)
		else:	# Fix missing LandkreisIDs in 27.04.2020 dataset.
			rd_lk = {}
			lkids = []
			for lki,lk in self.Landkreise.items():
				rd_lk[lk] = lki
			for i,l in dfid.filter(items=["Landkreis"],axis=1).iterrows():
				lkids.append(rd_lk[l[0]])
				
			df["LandkreisID"] = lkids
			print(df)
		
		df.drop(['Landkreis', 'Bundesland'], axis=1,inplace=True)
		
		cols = [x for x in ["Meldedatum","Refdatum"] if x in df.columns]
		for col in cols:
			if col in df:
				df[col] = df[col].apply(rdate)
		
		print(df.columns)
		
#		if "Referenzdatum" in df.columns:
#			df["Refdatum"] = df["Referenzdatum"]
#		if "Neuer Fall" in df.columns:
#			df["NeuerFall"] = df["Neuer Fall"]
		
		df["delay"] = df["Meldedatum"]-df["Refdatum"]
		df["delay"].apply(lambda x : x.days)
		
		dtrefdate = datetime.datetime(self.refdate.year,self.refdate.month,self.refdate.day)
		df["nRefd"] = df["Refdatum"].apply(lambda x : (x-dtrefdate).days)
		df["nMeld"] = df["Meldedatum"].apply(lambda x : (x-dtrefdate).days)
		
		self.datasets[date] = df
		t1 = time.time()
		print("Number of datasets in arcgis Download:%d in %.3f s"%(len(df),t1-t0))
		
	def toDatetime(self,day):
		y,m,d,f = day//10000,(day//100)%100,day%100,28
		if y < 100:
			y += 2000
		return datetime.date(y,m,d)
		
	def simpleDiff(self):
		known,unknown = {},{}
		dates = sorted(self.datasets.keys())
		for k in dates:
			d = self.datasets[k]
			
			knowns,unknowns = d[d["Meldedatum"] != d["Refdatum"]],d[d["Meldedatum"] == d["Refdatum"]]
			sk,su = sum(knowns["AnzahlFall"]),sum(unknowns["AnzahlFall"])
			print(sk,su,sk+su)
			
			
			sk,suk = [],[]
			for i in range(self.nfirst,self.nfirst+90):
				knownAtRef = knowns[knowns["nRefd"] == i]
				unknownAtRef = unknowns[unknowns["nRefd"] == i]
				sk.append( sum(knownAtRef["AnzahlFall"] ) )
				suk.append(sum(unknownAtRef["AnzahlFall"] ))
				
				
				# s2 = "%d\t"%i
				# for j in range(self.nfirst,self.nfirst+90):
				# 	knownAtRefbyMeld = knownAtRef[knownAtRef["nMeld"]==j]
				# 	z = sum(knownAtRefbyMeld["AnzahlFall"])
				# 	if z > 0:
				# 		s2 += "%d:%d\t"%(j,z)
				#
				# #	if knownAtRefbyMeld["NeuerFall"].count() > 0:
				# #		print(knownAtRefbyMeld["NeuerFall"].value_counts())
				# if len(s2) > 4:
				# 	print (s2)
				
		# Values equivalent to RKI daily report
			sk,suk = np.array(sk),np.array(suk)
			print(sum(sk),[x for x in sk])
			print(sum(suk),[x for x in suk])
			
		# Create Dicts
			dsk,dsuk = {},{}
			for i in range(len(sk)):
				day = self.firstdate+datetime.timedelta(days=i)
				day_id = (day.year%100)*10000+day.month*100+day.day
				dsk[day_id] = sk[i]
				dsuk[day_id] = suk[i]
			
			print(dsk)
			print(dsuk)
			
			print(k,knowns.keys())
			print(knowns["NeuerFall"].value_counts())
			
			
			known[k] = sk
			unknown[k] = suk
		
		
		for a,b in zip(dates[:-1],dates[1:]):
			print(known[b]-known[a])
			
			print(unknown[b]-unknown[a])
				#print (sum( d[d["Refdatum"]==td] ) )
				#print(td,k,td==k,sum(unknowns[unknowns["Refdatum"] == td]["AnzahlFall"]))
				
#				print( knowns["Refdatum"] == td )
#				print(k,i,td,sum(knowns[knowns["Refdatum"] == td]["AnzahlFall"]))
	
	def AnalyzeDeaths(self):
		sdates = sorted(self.datasets.keys())
		
		latest = self.datasets[sdates[-1]]
		latest_withDeaths = latest[latest["AnzahlTodesfall"] > 0]
		
		dead_h,dead = {},[]
		dead_m = np.zeros((40,40,),dtype=np.int32)
		dead_m2 = np.zeros((40,50,),dtype=np.int32)
		dead_dm = {}
		
		for d in sdates:
			ds = self.datasets[d]
			nDate = (d-self.refdate).days
			
		# Wolfsburg nursing home high death rate
			if True:
				#print(latest_withDeaths[latest_withDeaths["AnzahlTodesfall"] > 2])
				wb = ds[ds["IdLandkreis"] == 3103]
				wb0327 = wb[wb["nMeld"] == 86 ]
				wb0327_80 = wb0327[wb0327["Altersgruppe"] == "A80+"]
				print(d)
				print(wb0327_80.filter(items=["Geschlecht","Altersgruppe","AnzahlFall","NeuerFall","AnzahlTodesfall","NeuerTodesfall","AnzahlGenesen","NeuGenesen","Meldedatum","Refdatum","delay"],axis=1))
			
			nd = ds[ds["NeuerTodesfall"] == 1]
			nd1 = nd[nd["AnzahlFall"] == 1]
			ndref = nd1[nd1["Refdatum"] != nd1["Meldedatum"]]
			fndref = ndref.filter(items=["Altersgruppe","Geschlecht","nRefd","nMeld","delay"],axis=1)
			fndref["delay"] = fndref["delay"].map(lambda x : x.days)
			fndref["delay2"] = ndref["nMeld"].map(lambda x : nDate-x)
			fndref["delay3"] = ndref["nRefd"].map(lambda x : nDate-x)
			
			for i,d in fndref.iterrows():
				p = (d["delay"],d["delay2"])
				n = d["Geschlecht"]+"_"+d["Altersgruppe"]
				dead_h[n] = dead_h.get(n,[]) + [p]
				dead.append(p)	
				
				if d["delay"] > 0 and d["delay"] < 40 and d["delay2"] < 40:
					dead_m[d["delay"],d["delay2"]] += 1
				
				if d["delay"] > 0 and d["delay"] < 40 and d["delay3"] < 50:
					dead_m2[d["delay"],d["delay3"]] += 1
				
				dm = dead_dm.get(d["Altersgruppe"],[np.zeros(50,dtype=np.int32),np.zeros(50,dtype=np.int32),np.zeros(50,dtype=np.int32)])
				dead_dm[d["Altersgruppe"]] = dm
				if d["delay"] < 50:
					dm[0][d["delay"]] += 1
				if d["delay2"] < 50:
					dm[1][d["delay2"]] += 1
				if d["delay3"] < 50:
					dm[2][d["delay3"]] += 1
					
					
		fig = plt.figure(1,figsize=(15,8),frameon=True)
		fig.subplots_adjust(wspace=0.13,hspace=0.2,left=0.05,right=0.98,top=0.965,bottom=0.05)
		ax = plt.subplot(131)
		bx = plt.subplot(132)
		cx = [plt.subplot(333),plt.subplot(336),plt.subplot(339)]
		plasma = plt.cm.plasma
		
		tdead = zip(*dead)
		#ax.scatter(*tdead)
		dead_s =dead_m.sum()
		ax.set_title("KRI dist of deaths by delay between onset of illness / testing\nMeldedatum greater than RefDatum\nbetween %s and %s n = %d"%(sdates[0],sdates[-1],dead_s))
		
		ax.set_xlabel("Meldedatum - Refdatum")
		ax.set_ylabel("Todestag - Meldedatum")
		
		bx.set_xlabel("Meldedatum - Refdatum")
		bx.set_ylabel("Todestag - Refdatum")
		
		im1 = ax.imshow(dead_m.T,cmap="plasma",origin='lower')
		im2 = bx.imshow(dead_m2.T,cmap="plasma",origin='lower')
		
		for i,d in enumerate([{"data":dead_m.sum(axis=1),"text":"Meldedatum-Refdatum"},{"data":dead_m.sum(axis=0),"text":"Todestag-Meldedatum"},{"data":dead_m2.sum(axis=0),"text":"Todestag-Refdatum"}]):
#			cx[i].plot(d["data"]/dead_s,label=d["text"])
			
			for k,x in dead_dm.items():
				if x[i].sum() > 10:
					cx[i].plot(x[i]/x[i].sum(),label=k+" n=%d"%x[i].sum())
			
			cx[i].legend()
			cx[i].set_title(d["text"])
		
		
		
		plt.savefig("Deaths.pdf")
		plt.savefig("page/graph/Deaths.svg")
		plt.close()
			
	def compare(self,x):
		pass
		
	def CompileDataset(self):
		sit = ByDateOfOnset
		
class RKIarcgis(object):
	def __init__(self):
		pass

		
def main():
	arcgis = ArcgisSource()
	arcgis.AnalyzeDeaths()
	
	arcgis.simpleDiff()
	
	#bydate = ByDateOfOnset()
	#arcgis.compare(bydate)
	

if __name__=="__main__":
	main()
