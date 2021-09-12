var checkResult = function (arr) {
  for (var i = 0; i < 3; i++) {
    var rowSum = '';
    for (var j = 0; j < 3; j++) {
      rowSum += arr[i][j].player;
    }
    if (rowSum === 'OOO')
      return 'O'
    else if (rowSum === 'XXX')
      return 'X'
  }

  for (var i1 = 0; i1 < 3; i1++) {
    var colSum = '';
    
    for (var j1 = 0; j1 < 3; j1++) {
      colSum += arr[j1][i1].player;
    }
    if (colSum === 'OOO')
      return 'O'
    else if (colSum === 'XXX')
      return 'X'
  }

  if (arr[0][0].player + arr[1][1].player + arr[2][2].player === 'OOO')

    return 'O'
  else if (arr[0][0].player + arr[1][1].player + arr[2][2].player === 'XXX')
    return 'X'

  if (arr[2][0].player + arr[1][1].player + arr[0][2].player === 'OOO')
    return 'O'
  else if (arr[2][0].player + arr[1][1].player + arr[0][2].player === 'XXX')
    return 'X'
  var totalSum = 0;
  for (var i2 = 0; i2 < 3; i2++) {
    for (var j2 = 0; j2 < 3; j2++) {
      if (arr[j2][i2].player) {
        totalSum++
      }
    }
  }
  if (totalSum === 9)
    return 'TIE'
  else 
    return false
};

export default checkResult