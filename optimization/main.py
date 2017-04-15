import sqlite3
import pandas as pd
import numpy as np
from gurobipy import *
import datetime
import time

from Wanderworld import *

def generateNewRoute(model):
    route_tuples = []

    for (key,value) in model.LEGS.iteritems():
        if (value.x!=0) and key[0] != key[1]:
            #print key, cost[key], str(key[2])[-2:]
            route_tuples.append(key+(model.COST[key],))

    #print ""

    #print route_tuples
        
    route_tuples = sorted(route_tuples, key=lambda tup: tup[2]) #sorts on date
    route_tuples.append(model.MODEL.objVal) #adds price to list
    route_tuples = tuple(route_tuples) #transforms list to tuple
    
    return route_tuples

    #for i in route_tuples:
        #print i

if __name__ == "__main__":
	conn = sqlite3.connect("flight_sample.db")
	c = conn.cursor()
	query = c.execute('''SELECT * From flights ''')
	cols = [column[0] for column in query.description]
	results = pd.DataFrame.from_records(data = query.fetchall(), columns = cols)

	# results.to_csv('flights.csv')

	#df = pd.read_sql_query("SELECT * FROM table_name", conn)
	#dat = sqlite3.connect("flight.db")
	#query = dat.execute("SELECT * From flight")
	#cols = [column[0] for column in query.description]
	#results= pd.DataFrame.from_records(data = query.fetchall(), columns = cols)


	user_start = '2017-05-01T00:00:00'
	user_end = '2017-05-31T00:00:00'
	origins = results['origin_id'].unique()
	city_list = origins
	num_days = 15
	min_days = 2
	origin = 'ATL'
	#print city_list


	Example = WanderWorld(results)
	Example.inputTimeFrame(user_start, user_end, city_list, num_days, min_days, origin)
	Example.createInputDicts()
	Example.buildAndSolveModel()

	routes = []

	for model in Example.modelList:
		routes.append(generateNewRoute(model))

	#for model in Example.modelList:
    	#in main loop:
    	#routes.append(generateNewRoute(model))
    	#print routes
		#print routes

    	#sort and slice at very end:
	sorted_routes = sorted(routes, key=lambda tup: tup[-1]) #sorts on total price
	final_results = sorted_routes[0:4] #or however many we want to return

	# print 'length:',len(final_results)
	print final_results

	import csv
	with open('final_result.csv', 'wb') as myfile:
		wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
		wr.writerow(final_results)


