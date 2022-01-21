function cFetch(url = "", data = {}, operation = "POST") {
  return fetch("./api/" + url, {
    method: "POST",
    cache: "default",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
