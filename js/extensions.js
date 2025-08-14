if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

window.addEventListener('beforeunload', event => {

  const data = globalSession?.getStackNavigator.pop();
  if(data) {
    globalSession.loadSync(data);
    event.preventDefault();
    event.returnValue = "";
    return "";
  }


});