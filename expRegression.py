# complete
# logarithmic regression is the same as exponential regression
# you pass in the parameters (Y, X) instead of (X, Y), and 
# then your regression is ln((x-c)/a)/b.
import numpy as np
from scipy.optimize import leastsq

def getLinReg(x, y): 
  # formula from Mr. Li's MDM4U workbook.
  cp = 0 
  sx = 0
  sx2 = 0
  sy = 0
  for i in range(len(x)):
    cp += x[i]*y[i]
    sx += x[i]
    sx2 += x[i]*x[i]
    sy += y[i]

  a = (len(x)*cp-sx*sy)/(len(x)*sx2-sx*sx)
  b = (sy/len(x))-a*(sx/len(x))
  return [a, b]

X = np.linspace(1.0, 8.0, 8)
Y = np.array([6, 11.4, 24.6, 54, 87, 204, 381, 786])
def getExpReg(x, y):
  # x and y are list of x and y values
  # form: a*e^(bx)+c
  # it can be proven that any exponential expression can be converted into this form
  # e = 2.718281828... = Euler's number
  yy = []
  for i in range(y.size):
    yy.append(y[i])
  yy = np.array(yy)
  # the following lines give a good initial guess for a and b
  for i in range(x.size):
    y[i] = np.log(y[i])
    
  res = getLinReg(x, y)
  a = np.exp(res[1])
  b = res[0]
  c = 0
  def f(arr):
    return arr[0]*np.exp(arr[1]*x)+arr[2]-yy
  # leastsq does Gauss-Newton alg (i.e. gradient descent) for us
  return leastsq(f, [a, b, c])[0]

print(getExpReg(X, Y))
