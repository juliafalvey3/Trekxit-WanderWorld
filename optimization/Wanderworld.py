import sqlite3
import pandas as pd
import numpy as np
from gurobipy import *
import datetime
import time

from BuildModel import *
from dataProcessing import *

class WanderWorld:
    def __init__(self, fulldf): # initiate a model with all the data
        self.fulldf = fulldf
        self.rawDictionary = createRawDictionary(self.fulldf)
        self.version = 'V1'
        
    
    def inputTimeFrame(self,user_start, user_end, city_list, num_days, min_days, origin):
        # Start, end, list of cities, amount of time, minimum of days.
        self.user_start = user_start
        self.user_end = user_end
        self.listofCities = city_list 
        self.numofDays = num_days
        self.minDays = min_days
        self.origin = origin
        self.dates_list = createDatesList(self.user_start, self.user_end, self.numofDays)
        
    def createInputDicts(self):
        self.dictforCities = createDictforCities(self.rawDictionary, self.listofCities)
        self.legs = []
        self.sourceAvaiLegs = []
        self.avaiLegs = []
        for date_list in self.dates_list:
            sourceDict, nonsourceDict = createDictsforDates(date_list, self.dictforCities, self.origin)
            self.legs.append((date_list, sourceDict, nonsourceDict))
        
    def buildAndSolveModel(self):
        self.modelList = []
        for date_list, sourceAvaiLegs, avaiLegs in self.legs:
            m = BuildModel(self.version, date_list, self.listofCities, self.origin, sourceAvaiLegs, avaiLegs, self.minDays)
            m.solveModel()
            self.modelList.append(m)
        