function test(a) {
  for (let i = 0; i < 10; i++) {
    a+=1;
  }
  
  if (a == 1) {
    return 1;
  } else {
    return 0;
  }
}

export default test;