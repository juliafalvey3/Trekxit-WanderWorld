import sqlite3
import pandas as pd
import numpy as np
from gurobipy import *
import datetime
import time
import itertools

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

def extractRealDate(flight):
    departDate = flight[2]
    arriDate = flight[3]
    departDate_String = departDate.strftime("%Y-%m-%d")# %H:%M:%S")
    arriDate_String = arriDate.strftime("%Y-%m-%d")
    
    return departDate_String, arriDate_String

def main(origin, city_list, user_start, user_end, min_days, num_days):
	# print origin, city_list, user_start, user_end, min_days, num_days
	conn = sqlite3.connect("flights_final_4_13.db")
	c = conn.cursor()
	query = c.execute('''SELECT * From flights_min_city ''')
	cols = [column[0] for column in query.description]
	results = pd.DataFrame.from_records(data = query.fetchall(), columns = cols)

	# print results.head(5)

	# results.to_csv('flights.csv')

	#df = pd.read_sql_query("SELECT * FROM table_name", conn)
	#dat = sqlite3.connect("flight.db")
	#query = dat.execute("SELECT * From flight")
	#cols = [column[0] for column in query.description]
	#results= pd.DataFrame.from_records(data = query.fetchall(), columns = cols)


	
	#print city_list


	Example = WanderWorld(results)
	Example.inputTimeFrame(user_start, user_end, city_list, num_days, min_days, origin)
	# print Example.rawDictionary
	Example.createInputDicts()
	Example.buildAndSolveModel()
	codeMap = Example.cityCodeMap

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
	# print sorted_routes
	print sorted_routes
	final_results = sorted_routes[0:4] #or however many we want to return
	print final_results

	# print 'length:',len(final_results)
	# print final_results

	outputDict = {}
	outputDict['TripID'] = []
	outputDict['Seq'] = []
	# outputDict['Origin_ID'] = []
	outputDict['Origin_Name'] = []
	# outputDict['Dest_ID'] = []
	outputDict['Dest_Name'] = []
	outputDict['Price'] = []
	outputDict['Date1'] = []
	outputDict['Date2'] = []
	outputDict['Total_Price'] = [] 
	outputDict['QueryID'] = []

	QueryID = ''
	# Sample QueryID: Atlanta, London, Paris, Rome, 2017-05-01, 2017-05-31, 3, 10
	for city in city_list:
		QueryID += city
		QueryID += ', '

	user_start = user_start[0:10]
	user_end = user_end[0:10]

	QueryID += user_start
	QueryID += ','
	QueryID += user_end
	QueryID += ','
	QueryID += str(min_days)
	QueryID += ','
	QueryID += str(num_days)

	

    
	for tripID, route in enumerate(final_results):
		#print route
		totalPrice = route[-1]
		for seq, flight in enumerate(route): 
			if(flight==totalPrice):
				break
			outputDict['QueryID'].append(QueryID)
			outputDict['TripID'].append(tripID)
			outputDict['Seq'].append(seq)
			outputDict['Origin_Name'].append(flight[0])
			#outputDict['Origin_Name'].append(codeMap[flight[0]])
			outputDict['Dest_Name'].append(flight[1])
			#outputDict['Dest_Name'].append(codeMap[flight[1]])
			outputDict['Price'].append(flight[4])
			departDate_String, arriDate_String = extractRealDate(flight)
			outputDict['Date1'].append(departDate_String)
			outputDict['Date2'].append(arriDate_String)
			outputDict['Total_Price'].append(totalPrice) 
            
	#print outputDict
	# outputDF = pd.DataFrame.from_dict(outputDict)
	#print outputDF
    
	# outputDF.to_csv('niceOutput.csv',index=False) 
	return outputDict

#if __name__ == "__main__":
	#''

	

if __name__ == "__main__":
	#user_start = '2017-05-01T00:00:00'
	#user_end = '2017-05-31T00:00:00'
	begin = '2017-05-01T00:00:00'
	end = '2017-05-31T00:00:00'
	# origins = results['origin_id'].unique()
	# city_list = ['Atlanta', 'Orlando','Palma', 'London', 'Barcelona', 'Vienna']
	# num_days = 20
	# min_days = 2
	origin = 'Atlanta'

	fulllist = ['Amsterdam', 'Barcelona', 'Berlin', 'Copenhagen', 'Dublin', 'London', 'Palma', 'Paris', 'Rome', 'Vienna']

	city_combinations = itertools.combinations(fulllist, 5)

	real_outputDict = {}
	real_outputDict['TripID'] = []
	real_outputDict['Seq'] = []
	# outputDict['Origin_ID'] = []
	real_outputDict['Origin_Name'] = []
	# outputDict['Dest_ID'] = []
	real_outputDict['Dest_Name'] = []
	real_outputDict['Price'] = []
	real_outputDict['Date1'] = []
	real_outputDict['Date2'] = []
	real_outputDict['Total_Price'] = [] 
	real_outputDict['QueryID'] = []

	index = 0

	# size = 10*9*8*7/4/3/2/1*10*4*15


	for city_tuple in city_combinations:
		city_list = [origin]+list(city_tuple)

		# for min_days in range(1,4):
		for min_days in range(2,3):
			# for num_days in range((min_days+1)*6, 30):
			for num_days in range(21,22):
				startdate = datetime.datetime.strptime(begin, "%Y-%m-%dT%H:%M:%S").date()
				#for i in range(1, 31 - num_days + 1):
				for i in range(1,2):
					delta = datetime.timedelta(days=num_days)					
					user_start = startdate
					user_end = startdate + delta
					increment = datetime.timedelta(days=1)
					startdate = startdate+increment

					user_start = user_start.strftime("%Y-%m-%dT%H:%M:%S")
					user_end = user_end.strftime("%Y-%m-%dT%H:%M:%S")
					

					#user_start = user_start[0:10]
					#user_end = user_end[0:10]
					#print user_start, user_end

					# print user_start, user_end, min_days, num_days



					try:
						outputDict = main(origin, city_list, user_start, user_end, min_days, num_days)
						# print outputDict
					except:
						continue
					real_outputDict['QueryID'].append(outputDict['QueryID'])
					real_outputDict['TripID'].append(outputDict['TripID'])
					real_outputDict['Seq'].append(outputDict['Seq'])
					real_outputDict['Origin_Name'].append(outputDict['Origin_Name'])
					
					real_outputDict['Dest_Name'].append(outputDict['Dest_Name'])
					
					real_outputDict['Price'].append(outputDict['Price'])
					# departDate_String, arriDate_String = extractRealDate(flight)
					real_outputDict['Date1'].append(outputDict['Date1'])
					real_outputDict['Date2'].append(outputDict['Date2'])
					real_outputDict['Total_Price'].append(outputDict['Total_Price'])

					print index, ', Finished!!'
					index += 1



	real_output = pd.DataFrame.from_dict(real_outputDict)
	real_output.to_csv('extremlyniceOutput.csv', index=False)

	# outputDF = pd.DataFrame.from_dict(outputDict)
	#print outputDF
    
	# outputDF.to_csv('niceOutput.csv',index=False) 


	# main(origin, city_list, user_start, user_end, min_days, num_days)
	


