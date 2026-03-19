module.exports = (sortQuery) => {
  let sort = {};
  if (sortQuery) {
    let [key, value] = sortQuery.split("-");

    if(key === "name") {
      key = "title";
    }

    sort[key] = value === "desc" ? -1 : 1;
  } else {
    sort._id = -1;
  }
  return sort;
};