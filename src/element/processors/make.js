module.exports = (args, fn) => {
  fn.argc = args.length;
  fn.argsFromObject = args;
  return fn;
};
