import numpy as np
from scipy.optimize import leastsq

x = [1, 2, 3, 4]
y = [10, 5, 0, -5]
for i in range(len(x)):
    x[i] = float(x[i])
    y[i] = float(y[i])
x = np.array(x)
y = np.array(y)

# form: asin(bx+c)+d
ans = [0, 0, 0, 0, 999999999]
# this is the answer for a, b, c, d. The last number is R^2, initialized to inf
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
    cur += _*100 # punish very small periods
    if(cur < ans[4]):
        ans = [res[0], res[1], res[2], res[3], cur]
print([ans[0], ans[1], ans[2], ans[3]])