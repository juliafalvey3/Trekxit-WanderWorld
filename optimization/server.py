from flask import Flask, render_template
import json
app = Flask(__name__)

@app.route('/')
def index():
  return render_template('../wanderWorld.html')

@app.route('/trysth/',methods=['get'])

def runsth():
	a = [3,4,5,6]
	b = 4
	c = 5
	return json.dumps(a)



if __name__ == '__main__':
  app.run(debug=True)