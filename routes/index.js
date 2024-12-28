const Router = (server) => {
    // home route with the get method and a handler

    //Add routes
    server.get('/', function (req, res) {
        res.send('API - SYSTEM LOGIN');
    });

    server.get("/api", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our API homepage!",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    })
    };
    export default Router;