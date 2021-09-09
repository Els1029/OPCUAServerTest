const opcua = require("node-opcua");

const http = require('http');
const HtmlTableToJson = require('html-table-to-json');

var paintScale = [{LITRES: 0, KG: 0, GRAVITY: 0, BATCH: "temp", PRODUCT: "temp"},
    { LITRES: 0, KG: 0, GRAVITY: 0, BATCH: "temp", PRODUCT: "temp"},
    { LITRES: 0, KG: 0, GRAVITY: 0, BATCH: "Batch 3!!!!", PRODUCT: "temp"}];

// Let's create an instance of OPCUAServer

const paintURL = "<URL OF SCALES HERE>"

//Asynchronous Updates data from the scales. Called every second.
async function getData(){
    // console.log("Get Data Started!");
    // count++;
    http.get(paintURL, (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        // console.log("got data");
        data += chunk;
    });

    //   // The whole response has been received. Print out the result.
    resp.on('end', async() => {
        tables = HtmlTableToJson.parse(data);
        table = tables.results[0];
        //console.log(JSON.stringify(tables)); //number is the number of the table, for paint kitchen, it will be 0

        for(var i=0; i<table.length; i++)
        {
            paintScale[i] = table[i];
            // console.log(JSON.stringify(paintScale[i]));
            console.log("Data Received");
        }
    });

    }).on("error", (err) => {
    console.log("Error: " + err.message);
    });
}

function timer()
{
    // console.log("Timer Started");
    getData();
    setTimeout(()=>{
        // console.log("Timer Ended");
        timer();
    }, 1 * 1000)
}
console.log("Started");
timer();


const server = new opcua.OPCUAServer({
    port: 4334, // the port of the listening socket of the server
    resourcePath: "/UA/MyLittleServer", // this path will be added to the endpoint resource name
     buildInfo : {
        productName: "MySampleServer1",
        buildNumber: "7658",
        buildDate: new Date(2021,2,16)
    }
});

function post_initialize() {
    console.log("initialized");
    function construct_my_address_space(server) {
    
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();
    
        // declare a new object
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "MyDevice"
        });
	

        //ADDING PAINT INFO
        for(var i = 0; i < 3; i++)
        {
            
            scaleNum = i+1;
            //console.log("Loop " + scaleNum);

            /////////////////////////////////////SCALE 1 /////////////////////////
            //BATCH
            // scaleNum = i+1;
            namespace.addVariable({
                componentOf: device,
                nodeId: "ns=1;s=Batch"+scaleNum+";",
                browseName: "S"+scaleNum+"Batch",
                dataType: "String",
                value: {
                    browseName: this.browseName,
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.String, value: paintScale[this.browseName.name.replace("S", "").replace("Batch","")-1].BATCH });
                    }
                }
            });
            //PRODUCT 
            namespace.addVariable({
                componentOf: device,
                nodeId: "ns=1;s=Product"+scaleNum+";",
                browseName: "S"+scaleNum+"Product",
                dataType: "String",
                value: {
                    browseName: this.browseName,
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.String, value: paintScale[this.browseName.name.replace("S", "").replace("Product","")-1].PRODUCT });
                    }
                }
            });
            //Liters 
            namespace.addVariable({
                componentOf: device,
                nodeId: "ns=1;s=Liters"+scaleNum+";",
                browseName: "S"+scaleNum+"Liters",
                dataType: "Double",
                value: {
                    browseName: this.browseName,
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: paintScale[this.browseName.name.replace("S", "").replace("Liters","")-1].LITRES });
                    }
                }
            });
            //KG
            namespace.addVariable({
                componentOf: device,
                nodeId: "ns=1;s=KG"+scaleNum+";",
                browseName: "S"+scaleNum+"KG",
                dataType: "Double",
                value: {
                    browseName: this.browseName,
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: paintScale[this.browseName.name.replace("S", "").replace("KG","")-1].KG });
                    }
                }
            });
            //Gravity 
            namespace.addVariable({
                componentOf: device,
                nodeId: "ns=1;s=Gravity"+scaleNum+";",
                browseName: "S"+scaleNum+"Gravity",
                dataType: "Double",
                value: {
                    browseName: this.browseName,
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: paintScale[this.browseName.name.replace("S", "").replace("Gravity","")-1].GRAVITY });
                    }
                }
            });
        }
    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}
server.initialize(post_initialize);