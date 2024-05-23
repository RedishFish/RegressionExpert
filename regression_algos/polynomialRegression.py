# complete
# X = [1, 2, 3, 4, 5, 6, 7, 8]
# Y = [11, 29, 63, 119, 203, 321, 479, 683]

X = [1, 4.5, -7.5]
Y = [10.5, 38.5, 72.3]
deg = 3
def getPolyReg(x, y, ord):
  # x: array of x-coordinates, y: array of y-coordinates
  # ord: degree (order) of the polynomial
  # this algorithm generates a matrix equation which, when solved,
  # gives the coefficients of the optimal regression.
  mat = [] # the matrix
  col = [] # the column vector part of the matrix equation
  sums = []
  for i in range(2*ord+1):
    sum = 0
    for j in range(len(x)):
      sum += x[j]**i
    sums.append(sum)
  
  for i in range(ord+1):
    row = []
    for j in range(ord+1):
      row.append(sums[i+j])
    mat.append(row)
  for i in range(ord+1):
    sum = 0
    for j in range(len(x)):
      sum += y[j]*(x[j]**i)
    col.append(sum)
  # now the initialization of the matrix equation is complete. 
  # now solve the equation using Gaussian Elimination
  for i in range(ord+1):
    # Gaussian elimination: for the i-th row, eliminate the i-th 
    # term (reduce to 0) of every row under it. Modify the other 
    # terms accordingly 
    for j in range(i+1, ord+1):
      div = mat[j][i]/mat[i][i]
      for k in range(ord+1):
        mat[j][k] -= div*mat[i][k]
      col[j] -= div*col[i]
  # now the matrix is in row echelon form
  # now solve using back substitution
  for i in range(ord, -1, -1):
    for j in range(i-1, -1, -1):
      div = mat[j][i]/mat[i][i]
      mat[j][i] = 0
      col[j] -= div*col[i]
  coeff = [] # this is the list of coefficients of the polynomial, listed from the 0th-term (constant) to the largest degreed term
  for i in range(ord+1):
    coeff.append(col[i]/mat[i][i])
  return coeff
  
print(getPolyReg(X, Y, deg))
