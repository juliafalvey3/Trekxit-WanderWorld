import sqlite3
import pandas as pd
import numpy as np
from gurobipy import *
import datetime
import time

def createCityCodeMap(fulldf):
    # just leave a plug in here... have something wrong with the dataset 
    # so we'll just do it manually
    cities=['ATL','MCO','LHR','CDG','AMS','FRA','IST','MAD','BCN','LGW','MUC','FCO', \
    'SVO','ORY','SAW','CPH','DME','DUB','ZRH','PMI','MAN','OSL', \
    'ARN','STN','DUS','VIE','LIS','BRU','TXL','ATH','MXP','AYT']
    codeMap = {
    'ATL': 'Atlanta',
    'MCO': 'Orlando',
    'LHR': 'London' , 
    'CDG': 'Paris',
    'AMS': 'Amsterdam',
    'FRA': 'Frankfurt',
    'IST': 'Istanbul',
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
    'LGW': 'London',
    'MUC': 'Munich',
    'FCO': 'Rome',
    'SVO': 'Moscow',
    'ORY': 'Paris',
    'SAW': 'Istanbul',
    'CPH': 'Copenhagen',
    'DME': 'Moscow',
    'DUB': 'Dublin',
    'ZRH': 'Zurich',
    'PMI': 'Palma',
    'MAN': 'Manchester',
    'OSL': 'Oslo',
    'ARN': 'Stockholm',
    'STN': 'London',
    'DUS': 'Dusseldorf',
    'VIE': 'Vienna',
    'LIS': 'Lisbon',
    'BRU': 'Brussels',
    'TXL': 'Berlin',
    'ATH': 'Athens',
    'MXP': 'Milan',
    'AYT': 'Antalya',
    'LON': 'London' # trouble shooting from here
    }

    return codeMap



def createDatesList(user_start, user_end, num_days):
    #num_days = 10 #this should be specified by the user

    #user_start = '2017-05-01T00:00:00'
    #user_end = '2017-05-31T00:00:00'
    #reads in the first and last day of the full timeframe of the user

    try:
        dt_start = datetime.datetime.strptime(user_start, "%Y-%m-%dT%H:%M:%S").date()
        dt_end = datetime.datetime.strptime(user_end, "%Y-%m-%dT%H:%M:%S").date()
    except ValueError:
        print ("Incorrect format")

    delta = dt_end - dt_start
    totalnumdays = delta.days
    date_list = [dt_start + datetime.timedelta(days=x) for x in range(0, totalnumdays)]

    dates = []
    dates_list = []
    for i in range(0,len(date_list)-num_days+1):
        dates = date_list[0:num_days]
        dates_list.append(dates)
        date_list.pop(0)
    return dates_list

def createRawDictionary(fulldf, listofCities):
    # create dictionary of dataframes

    # origins = fulldf['origin_id'].unique()
    cities = listofCities
    origins = cities

    cities = ['Atlanta', 'Orlando','Palma', 'London', 'Barcelona']
    origins = cities

    results_origin_filtered = fulldf[fulldf['origin_city_name'].isin(cities)]
    results_dest_filtered = results_origin_filtered[results_origin_filtered['destination_city_name'].isin(cities)]

    originsDict = {}
    for i in origins:
        originsDict[i] = results_dest_filtered[results_dest_filtered['origin_city_name'] == i]

    #results_origin_filtered = fulldf[fulldf['origin_city_name'].isin(cities)]
    #results_dest_filtered = results_origin_filtered[results_origin_filtered['destination_city_name'].isin(cities)]

    #originsDict = {}
    #for i in origins:
    #    originsDict[i] = results_dest_filtered[results_dest_filtered['origin_city_name'] == i]

    #print originDict
        
    # create dictionary for optimization model
    # format: {origin: destination1:{date1:price1, date2:price2},
    #                  destination2:{date1:price1, date2:price2}}

    X = {}
    for i in originsDict.keys():
        X[i] = {}

    for i in origins:
        for index, row in originsDict[i].iterrows():
            X[i][row['destination_city_name']] = {}
        for index, row in originsDict[i].iterrows():
            X[i][row['destination_city_name']][datetime.datetime.strptime(row['outbound_date'], "%Y-%m-%dT%H:%M:%S").date()]= \
            (datetime.datetime.strptime(row['inbound_date'], "%Y-%m-%dT%H:%M:%S").date(), row['price'])

    # print X
    return X

def createDictforCities(rawDictionary, city_list):
    #create dummy dictionary of cities of interest
    #month of May

    Xcopy = rawDictionary.copy()
    Y = {}
    key_list = city_list

    for i in Xcopy.keys():
        if i in key_list:
            Y[i] = Xcopy[i]

    for i in Y.keys():
        for j in Y[i].keys():
            if j not in key_list:
                Y[i][j] = {}
        Y[i] = dict((k, v) for k, v in Y[i].iteritems() if v != {}) 
    #print 'Y:', Y

    return Y

def createDictsforDates(date_list, dictforCities, source):
    Ycopy = dictforCities.copy()
    Z = {}
    for i in Ycopy.keys():
        Z[i] = {}
        for j in Ycopy[i].keys():
            Z[i][j] = {}
            for k in Ycopy[i][j].keys():
                if k in date_list:
                    Z[i][j][k] = Ycopy[i][j][k]
                else:
                    Z[i][j][k] = {}
            Z[i][j] = dict((k, v) for k, v in Z[i][j].iteritems() if v != {})
    
    # Source Dictionary
    # source = 'ATL'

    Zcopy = Z.copy()
    S = {}

    for i in Zcopy.keys():
        if i == source:
            S[source] = Zcopy[source]
        else:
            S[i] = {}

    for i in S.keys():
        if source in Zcopy[i].keys():
            S[i][source] = Zcopy[i][source]

    S = dict((k, v) for k, v in S.iteritems() if v != {})
    #print 'S:', S
    
    # non-source dictionary

    Zcopy2 = Z.copy()
    Zcopy2[source] = {}
    Zcopy2 = dict((k, v) for k, v in Zcopy2.iteritems() if v != {})
    #with our current dataset, this will get rid of keys other than the source
    #since we are missing so many flights

    for i in Zcopy2.keys():
        if source in Zcopy2[i].keys():
            Zcopy2[i][source] = {}
        Zcopy2[i] = dict((k, v) for k, v in Zcopy2[i].iteritems() if v != {})
    
    Zcopy2 = dict((k, v) for k, v in Zcopy2.iteritems() if v != {})
    
    dt_start = date_list[0] #datetime.date(2017, 5, 1)
    dt_end = date_list[-1] #datetime.date(2017, 5, 30)
    #this should come from the iteration:
    #for day in dates_list: dt_start = day[0], dt_end = day[-1]

    print date_list[0]
    Scopy = S.copy()
    T = {}

    for i in Scopy.keys():
        T[i] = {}
        for j in Scopy[i].keys():
            T[i][j] = {}

    
    for i in Scopy[source].keys():
        for j in Scopy[source][i].keys():
            if j == dt_start:
                T[source][i][j] = S[source][i][j]

    for i in Scopy.keys():
        if i != source:
            for j in Scopy[i][source].keys():
                if j == dt_end:
                    T[i][source][j] = Scopy[i][source][j]
                
    sourceDict = T

    nonsourceDict = dict(Zcopy2)

    for i in nonsourceDict.keys():
        for j in nonsourceDict[i].keys():
            try:
                del nonsourceDict[i][j][dt_start]
            except:
                ''
            try:
                del nonsourceDict[i][j][dt_end]
            except:
                ''
            
    return sourceDict, nonsourceDict


