// True when the value consists of digits only (ids, EAN codes), so it is safe in SQL and file names.
const isDigits = (value) => /^[0-9]+$/.test(String(value));

module.exports = { isDigits };
