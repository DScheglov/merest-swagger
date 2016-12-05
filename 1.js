function f() {
  console.dir(arguments, {depth: 1});
}

var g = f.bind({x: 1}, 2, 3, "s");

g();
