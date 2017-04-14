import sqlite3
import pandas as pd
import numpy as np
from gurobipy import *
import datetime
import time


class BuildModel:
    def __init__(self, version, date_list, city_list, source, sourceAvaiLegs, avaiLegs, minDays): # initiate a model with all the data
        self.version = version
        self.firstDate = date_list[0]
        self.lastDate = date_list[-1]
        self.real_dates = date_list[1:]
        self.real_cities = []
        for key in avaiLegs:
            self.real_cities.append(key)
        self.minDays = minDays
        self.sourceAvaiLegs = sourceAvaiLegs
        self.avaiLegs = avaiLegs
        self.SourceCity = source
    
    def solveModel(self):
        
        # new model here
        model = Model("WanderWorld")


        # Add variables
        # Now we have all the available source-related legs in 'sourceAvaiLegs'
        # all the remaining available legs in 'avaiLegs' 
        # all the inventory legs in 'invLegs' (well maybe we don't need this...)
        # and they are all in the same format

        legs = {} # available legs variables
        cost = {} # corresponding cost

        for origin, destDic in self.sourceAvaiLegs.iteritems():
            if(origin==self.SourceCity):
                for dest, dateDic in destDic.iteritems():
                    for date, price in dateDic.iteritems():
                        legs[origin, dest, date, price[0]+datetime.timedelta(days=1)] = model.addVar(
                            vtype=GRB.BINARY, name="Source_{}_to_{}_day_{}_{}".format(
                                origin, dest, date, price[0]))
                        cost[origin, dest, date, price[0]+datetime.timedelta(days=1)] = price[1]
            else:
                for dest, dateDic in destDic.iteritems():
                    for date, price in dateDic.iteritems():
                        legs[origin, dest, date, price[0]+datetime.timedelta(days=1)] = model.addVar(
                            vtype=GRB.BINARY, name="Sink_{}_to_{}_day_{}_{}".format(
                                origin, dest, date, price[0]))
                        cost[origin, dest, date, price[0]+datetime.timedelta(days=1)] = price[1]
                
        for origin, destDic in self.avaiLegs.iteritems():
            for dest, dateDic in destDic.iteritems():
                for date, price in dateDic.iteritems():
                    legs[origin, dest, date, price[0]+datetime.timedelta(days=1)] = model.addVar(
                        vtype=GRB.BINARY, name="{}_to_{}_day_{}_{}".format(
                            origin, dest, date, price[0]))
                    cost[origin, dest, date, price[0]+datetime.timedelta(days=1)] = price[1]

        model.update()
        # print len(legs), len(cost)

        avaiLegsByDest = {} # record all the available legs by Destination, no Inventory
        avaiLegsByOri = {} # record all the available legs by Origin, no Inventory
        for (origin, destination, depart, arri) in legs: # Without Inventory Variables
            try:
                avaiLegsByDest[destination].append((origin, destination, depart, arri))
            except:
                avaiLegsByDest[destination] = [(origin, destination, depart, arri)]
            try:
                avaiLegsByOri[origin].append((origin, destination, depart, arri))
            except:
                avaiLegsByOri[origin] = [(origin, destination, depart, arri)]

        # Add the inventory arcs
        # Inventory Variables
        for date in self.real_dates:
            for city in self.real_cities:
                legs[city, city, date, date+datetime.timedelta(days=1)] = \
                model.addVar(vtype=GRB.BINARY, name="Inventory_{}_day_{}".format(
                            city, date))

        model.update()

        allLegsByDest = {} # record all the available legs by Destination
        allLegsByOri = {} # record all the available legs by Origin
        for (origin, destination, depart, arri) in legs: # Without Inventory Variables
            try:
                allLegsByDest[destination,arri].append((origin, destination, depart, arri))
            except:
                allLegsByDest[destination,arri] = [(origin, destination, depart, arri)]
            try:
                allLegsByOri[origin,depart].append((origin, destination, depart, arri))
            except:
                allLegsByOri[origin,depart] = [(origin, destination, depart, arri)]          
        
        # Set Constraints
        UpperBound = 10
        LowerBound = self.minDays # can stay LowerBound + 1 nights

        # all cities covered and visited only once
        for destination in avaiLegsByDest:
            model.addConstr(quicksum(legs[origin, destination, depart, arri] 
                             for (origin,dest,depart,arri) in avaiLegsByDest[destination])== 1,
                   "VisitOnlyOnce_{}".format(destination))

        # min and max number of days (inventory constraints)
        for city in self.real_cities:
            model.addConstr(quicksum(legs[city, city, date, date+datetime.timedelta(days=1)] 
                             for date in self.real_dates) <= UpperBound,
                   "Stay_Upper_Bound_{}".format(city))
            model.addConstr(quicksum(legs[city, city, date, date+datetime.timedelta(days=1)] 
                             for date in self.real_dates) >= LowerBound,
                   "Stay_Lower_Bound_{}".format(city))

        # Flow Balance
        # Aux Arc balance
        SourceFlow = quicksum(legs[origin, destination, depart, arri]
                        for (origin, destination, depart, arri) in allLegsByOri[self.SourceCity,self.firstDate])
        SinkFlow = quicksum(legs[origin, destination, depart, arri]
                        for (origin, destination, depart, arri) in allLegsByDest[
                self.SourceCity,self.lastDate+datetime.timedelta(days=1)])
        model.addConstr(SourceFlow==1, "SourceOneOut")
        model.addConstr(SinkFlow==1, "SinkOneIn")

        # Ordinary balance
        for city in self.real_cities:
            for date in self.real_dates:
                if(date==self.firstDate):
                    continue
                else:
                    In = 0
                    Out = 0
                    if(allLegsByDest.has_key((city,date))):
                        In = quicksum(legs[origin, destination, depart, arri] 
                                     for (origin, destination, depart, arri) in allLegsByDest[city,date])
                    else:
                        ''
                    if(allLegsByOri.has_key((city,date))):
                        Out = quicksum(legs[origin, destination, depart, arri] 
                                     for (origin, destination, depart, arri) in allLegsByOri[city,date])
                    else:
                        ''
                model.addConstr(In == Out, "FlowBalance_{}_day_{}".format(city,date))

        model.update()
        
        # Set Objectives
        obj = quicksum(cost[key]*legs[key] for key in cost)

        model.setObjective(obj, GRB.MINIMIZE)

        model.update()

        model.optimize()
        
        self.MODEL = model
        self.LEGS = legs
        self.COST = cost
        