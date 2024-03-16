export function format_date(s) {
  var options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };
  const dtFormat = new Intl.DateTimeFormat("en-GB", options);

  return dtFormat.format(new Date(s * 1e3));
}

export function format_timestamp(s) {
  var options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
  };
  const dtFormat = new Intl.DateTimeFormat("en-GB", options);

  return dtFormat.format(new Date(s * 1e3));
}

export function format_timestamp_short(s) {
  var options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
  };
  const dtFormat = new Intl.DateTimeFormat("en-GB", options);

  return dtFormat.format(new Date(s * 1e3));
}
