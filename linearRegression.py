# complete
X = [1, 1, 2, 3, 3, 4]
Y = [1, 2.5, 2, 0.5, 3, 3] # X and Y values pairs of the points

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

print(getLinReg(X, Y)[0])
print(getLinReg(X, Y)[1])
