from gurobipy import *
import numpy as np
import datetime
import time

class BuildModel:
    def __init__(self, fulldf): # initiate a model with all the data
        self.fulldf = fulldf
        
    
    def imputTimeFrame():
        self.start = start
        self.end = end
        
    def createInputDic():
        self.sourceAvaiLegs = {}
        self.avaiLegs = {}
        
    def createModel():
        self.m = Model("Wanderworld")
        self.legs = {}
        self.cost = {}
        
    def addVariables():
        ''
        self.legs = {} # add the legs excluding the inventory
        self.cost = {} # add the corresponding cost
        self.avaiLegsByDest = {} # record all the available legs by Destination, no Inventory
        self.avaiLegsByOri = {} # record all the available legs by Origin, no Inventory
        
        self.legs = {} # add the inventory legs
        
        self.allLegsByDest = {} # record all the available legs by Destination
        self.allLegsByOri = {} # record all the available legs by Origin
        
        self.m.update()
        
        
    def addConstraints():
        # all cities covered and visited only once
        self.m.addConstr
        # min and max number of days (inventory constraints)
        
        # Flow Balance
        # Aux Arc balance
        
        # Ordinary balance
        
        
        self.m.update()
        
    def setObjandSolve():
        self.obj = ''
        self.m.setObjective(self.obj, GRB.MINIMIZE)
        self.m.update()
        self.m.optimize()
        
    def getVariables():
        for v in self.m.getVars():
            print v.varName, v.x
            
        print 'Obj:', self.model.objVal