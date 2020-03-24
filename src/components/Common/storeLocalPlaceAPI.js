//if no data, post api to store data to db
        // const res = await fetch(`http://localhost:5001/no-excuse-1579439547243/us-central1/getGymDataFromLocal`, {
        //     body: targetArea, // must match "Content-Type" header
        //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //     credentials: "same-origin", // include, same-origin, *omit
        //     headers: {
        //       "user-agent": "Mozilla/4.0 MDN Example",
        //       "content-type": "application/json"
        //     },
        //     method: "POST", // *GET, POST, PUT, DELETE, etc.
        //     mode: "no-cors", // no-cors, cors, *same-origin
        //     redirect: "follow", // manual, *follow, error
        //     referrer: "no-referrer", // *client, no-referrer
        // });

        // storePlaceToDb = () => {
        //     TaipeiDistrict.forEach( async (district) => {
        //         console.log(district)
        //         const res = await fetch(`http://localhost:5001/no-excuse-1579439547243/us-central1/getGymDataFromLocalStoreToDB`, {
        //             body: district, 
        //             cache: "no-cache", 
        //             credentials: "same-origin", 
        //             headers: {
        //             "user-agent": "Mozilla/4.0 MDN Example",
        //             "content-type": "application/json"
        //             },
        //             method: "POST", 
        //             mode: "no-cors", 
        //             redirect: "follow", 
        //             referrer: "no-referrer", 
        //         });
        //     })
        // }