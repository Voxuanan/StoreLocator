const info = document.querySelector("#info");
const btnClose = document.querySelector("#btn-close");
const infoContainer = document.querySelector("#info-container");

// side info
btnClose.addEventListener("click", () => {
    info.classList.remove("active");
});

async function initMap() {
    let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 16.457991, lng: 107.588967 },
        zoom: 15,
    });

    //Create button to get user current location
    let infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }

    //Display all marker
    // await fetch("http://localhost:5000/api/v1/stores")
    //     .then((response) => response.json())
    //     .then((data) => {
    //         data.data.forEach((item, index) => {
    //             const uluru = {
    //                 lat: item.location.coordinates[1],
    //                 lng: item.location.coordinates[0],
    //             };
    //             const marker = new google.maps.Marker({
    //                 position: uluru,
    //                 label: item.name,
    //                 map: map,
    //             });
    //             const contentString = `
    //                 <div id="content">
    //                     <div id="siteNotice">
    //                     </div>
    //                     <h3 id="firstHeading" class="firstHeading">${item.name}</h3>
    //                     <div id="bodyContent">
    //                         <img src="./${item.image}"  alt="image" style="width: 150px; height: 75px; object-fit: contain;"
    // onerror="this.onerror=null;this.src='./uploads/default.jpg';"/>
    //                     </div>
    //                 </div>
    //             `;
    //             const infowindow = new google.maps.InfoWindow({
    //                 content: contentString,
    //             });
    //             marker.addListener("click", () => {
    //                 infowindow.open({
    //                     anchor: marker,
    //                     map,
    //                     shouldFocus: false,
    //                 });
    //             });
    //         });
    //     });

    //Display makers when it appears in view
    google.maps.event.addListener(map, "bounds_changed", function () {
        calcBounds();
    });
    let makers = [];
    async function calcBounds() {
        const aNorth = map.getBounds().getNorthEast().lat();
        const aEast = map.getBounds().getNorthEast().lng();
        const aSouth = map.getBounds().getSouthWest().lat();
        const aWest = map.getBounds().getSouthWest().lng();
        await fetch(`http://localhost:5000/api/v1/stores/${aNorth}/${aWest}/${aSouth}/${aEast}`)
            .then((response) => response.json())
            .then((data) => {
                data &&
                    data.data &&
                    data.data.forEach((item, index) => {
                        const uluru = {
                            lat: item.location.coordinates[1],
                            lng: item.location.coordinates[0],
                        };
                        if (makers.indexOf(JSON.stringify(uluru)) == -1) {
                            makers.push(JSON.stringify(uluru));
                            const icon = {
                                url: "./images/shop.png", // url
                                scaledSize: new google.maps.Size(50, 50), // scaled size
                                origin: new google.maps.Point(0, 0), // origin
                                anchor: new google.maps.Point(0, 0), // anchor
                            };
                            const marker = new google.maps.Marker({
                                position: uluru,
                                label: {
                                    text: item.name,
                                    color: "black",
                                    fontWeight: "bold",
                                    textShadow: "2px 2px #ff0000",
                                },
                                map: map,
                                icon: icon,
                            });

                            // Infowindow
                            // const contentInfoWindow = `
                            //             <div id="content">
                            //                 <div id="siteNotice">
                            //                 </div>
                            //                 <h3 id="firstHeading" class="firstHeading">${item.name}</h3>
                            //                 <div id="bodyContent">
                            //                     <img src="./${item.image}" alt="image" style="width: 150px; height: 75px; object-fit: contain;"
                            //                     onerror="this.onerror=null;this.src='./uploads/default.jpg';"/>
                            //                     <div style="display: flex">${item.info}</div>
                            //                 </div>
                            //             </div>
                            //         `;
                            // const infowindow = new google.maps.InfoWindow({
                            //     content: contentInfoWindow,
                            // });
                            const contentInfoContainer = `
                                        <div id="bodyContent">
                                            <div style="padding: 10px">
                                                <img src="./${item.image}" alt="image" style="width:100%;object-fit: contain;"
                                                onerror="this.onerror=null;this.src='./uploads/default.jpg';"/>
                                            </div>
                                            <h1 id="firstHeading" class="firstHeading">${item.name}</h1>
                                            <div style="display: flex">${item.location.formattedAddress}</div>
                                            <div style="display: flex">${item.info}</div>
                                        </div>
                                `;
                            marker.addListener("click", () => {
                                // infowindow.open({
                                //     anchor: marker,
                                //     map,
                                //     shouldFocus: false,
                                // });
                                info.classList.add("active");
                                infoContainer.innerHTML = contentInfoContainer;
                            });
                        }
                    });
            });
    }
}

window.initMap = initMap;
