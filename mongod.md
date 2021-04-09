## export:

mongoexport --uri="mongodb://localhost:27017/research" --collection=airlinereports --out=airlinereports.json
mongoexport --uri="mongodb://localhost:27017/research" --collection=flights --out=flights.json
mongoexport --uri="mongodb://localhost:27017/research" --collection=airlines --out=airlines.json
