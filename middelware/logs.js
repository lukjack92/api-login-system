//Middleware Logging
module.exports = {
  logger: (req, res, next) => {
    //     let current_datetime = new Date();
    //     let formatted_date =
    //     current_datetime.getFullYear() +
    //     "-" +
    //     (current_datetime.getMonth() + 1) +
    //     "-" +
    //     current_datetime.getDate() +
    //     " " +
    //     current_datetime.getHours() +
    //     ":" +
    //     current_datetime.getMinutes() +
    //     ":" +
    //     current_datetime.getSeconds();
    //     let method = req.method;
    //     let url = req.url;
    //     let status = res.statusCode;
    //     let ip = req.ip;
    //     let hostname = req.hostname;
    //     const start = process.hrtime();
    //     let log = `[${formatted_date}] ${method}: ${ip} ${hostname} ${url} ${status}`;
    //     console.log("==================================================");
    //     console.log(log);
    //     console.log(req.headers)
    //     console.log("==================================================");
    //     //console.log("Requset Body: ", req);
    //     console.log("Requset Body: ", req.ip +" "+ req.hostname +" "+ req.path);      //console.log("Response Body ", res);
    // console.log("Request status code: ", req.statusCode);
    //     next();
    const start = process.hrtime();
    const current_datetime = new Date();
    const formatted_date = `${current_datetime.getFullYear()}-${
      current_datetime.getMonth() + 1
    }-${current_datetime.getDate()} ${current_datetime.getHours()}:${current_datetime.getMinutes()}:${current_datetime.getSeconds()}`;
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    const hostname = req.hostname;

    res.on("finish", () => {
      const duration = process.hrtime(start);
      const durationInMs = duration[0] * 1000 + duration[1] / 1e6;
      const status = res.statusCode;
      const log = `[${formatted_date}] ${method}: ${ip} ${hostname} ${url} ${status} - ${durationInMs.toFixed(3)} ms`;
      console.log(log);
      console.log(req.headers);
    });

    next();
  },
};
