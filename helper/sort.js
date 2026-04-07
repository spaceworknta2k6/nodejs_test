module.exports = (sortQuery) => {
  let sort = {
    position: 1,
    _id: -1,
  };

  if (sortQuery) {
    let [key, value] = sortQuery.split("-");

    if(key === "name") {
      key = "title";
    }

    sort = {};
    sort[key] = value === "desc" ? -1 : 1;
  }

  return sort;
};
