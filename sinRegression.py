# complete, but is not guaranteed to give correct answer every time
import numpy as np
from scipy.optimize import leastsq

N = 100 # number of data points
X = np.linspace(0, 4*np.pi, N) 
Y = 3.0*np.sin(1.3*X+0.001) + 0.5

def getSinReg(x, y):
  # form: asin(bx+c)+d
  ans = [0, 0, 0, 0, 999999999]
  for _ in range(100):
    # these 4 values are initial guesses
    # because there is no good way to guess b, we brute force all possibilities < 20
    a = np.sqrt(np.mean(x)**2-np.std(x)**2)
    b = 0.2+_*0.2
    c = 0
    d = np.mean(x)
    
    func = lambda arr: arr[0]*np.sin(arr[1]*x+arr[2]) + arr[3] - y
    res = leastsq(func, [a, b, c, d])[0]
    cur = 0
    for i in range(x.size):
      cur += (a*np.sin(b*x[i]+c)+d-y[i])**2
    if(cur < ans[4]):
      ans = [res[0], res[1], res[2], res[3], cur]
  return [ans[0], ans[1], ans[2], ans[3]]
  
print(getSinReg(X, Y))
