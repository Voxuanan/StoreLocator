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
                            let rating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                            item.reviews.forEach((review) => {
                                if (review && review.star) {
                                    rating[review.star]++;
                                }
                            });
                            let averageRating =
                                Math.round(
                                    ((rating[1] +
                                        rating[2] * 2 +
                                        rating[3] * 3 +
                                        rating[4] * 4 +
                                        rating[5] * 5) /
                                        item.reviews.length) *
                                        10
                                ) / 10;

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
                                                <img src="./${
                                                    item.image
                                                }" alt="image" style="width:100%;object-fit: cover; height:200px"
                                                onerror="this.onerror=null;this.src='./uploads/default.jpg';"/>
                                            </div>
                                            <h1 style="padding:5px 10px">${item.name}</h1>
                                            <div style="padding:10px">${
                                                item.location.formattedAddress
                                            }</div>
                                            <div style="padding:10px">${item.info}</div>
                                            <div class="row" style="padding: 5px;
                                                margin: 5px;
                                                background: #ccc;
                                                border-radius: 5px;">
                                            <div class="col-8">
                                                <table class="rating">
                                                <tr>
                                                    <td>5</td>
                                                    <td>
                                                        <div class="progress">
                                                            <div class="progress-bar bg-warning" 
                                                                role="progressbar" 
                                                                style="width: ${
                                                                    (rating[5] /
                                                                        item.reviews.length) *
                                                                    100
                                                                }%" aria-valuenow="${rating[5]}" 
                                                                aria-valuemin="0" aria-valuemax="${
                                                                    item.reviews.length
                                                                }">
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>
                                                        <div class="progress">
                                                        <div class="progress-bar bg-warning" 
                                                                role="progressbar" 
                                                                style="width: ${
                                                                    (rating[4] /
                                                                        item.reviews.length) *
                                                                    100
                                                                }%" aria-valuenow="${rating[4]}" 
                                                                aria-valuemin="0" aria-valuemax="${
                                                                    item.reviews.length
                                                                }">
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <td>3</td>
                                                    <td>
                                                        <div class="progress">
                                                            <div class="progress-bar bg-warning" 
                                                                role="progressbar" 
                                                                style="width: ${
                                                                    (rating[3] /
                                                                        item.reviews.length) *
                                                                    100
                                                                }%" aria-valuenow="${rating[3]}" 
                                                                aria-valuemin="0" aria-valuemax="${
                                                                    item.reviews.length
                                                                }">
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                    <td>2</td>
                                                    <td>
                                                    <div class="progress">
                                                        <div class="progress-bar bg-warning" 
                                                            role="progressbar" 
                                                            style="width: ${
                                                                (rating[2] / item.reviews.length) *
                                                                100
                                                            }%" aria-valuenow="${rating[2]}" 
                                                            aria-valuemin="0" aria-valuemax="${
                                                                item.reviews.length
                                                            }">
                                                        </div>
                                                    </div>
                                                </td>
                                                </tr>
                                                    <td>1</td>
                                                    <td>
                                                    <div class="progress">
                                                        <div class="progress-bar bg-warning" 
                                                            role="progressbar" 
                                                            style="width: ${
                                                                (rating[1] / item.reviews.length) *
                                                                100
                                                            }%" aria-valuenow="${rating[1]}" 
                                                            aria-valuemin="0" aria-valuemax="${
                                                                item.reviews.length
                                                            }">
                                                        </div>
                                                    </div>
                                                </td>
                                                </tr>
                                                </table>
                                            </div>
                                            <div class="col-4 justify-content-center align-items-center d-flex flex-column">
                                                <h2>${averageRating}</h2>
                                                <p>${item.reviews.length} reviews</p>
                                            </div>
                                            </div>
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
