import React from "react";
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Chakrata',
        description: `Chakrata is a cantonment town and also a sub district/tehsil, in Dehradun district[1] in the state of Uttarakhand, India.
                        It lies between the Tons and Yamuna rivers, at an elevation of 2118 m, 98 km from the state capital, Dehradun. Chakrata was originally a cantonment of the British Indian Army. 
                        To the west lies Shillai, Himachal Pradesh, and to the east are Mussoorie (73 km) and Tehri Garhwal.`,
        imageUrl: 'https://www.savaari.com/blog/wp-content/uploads/2022/04/n2n-travelers-HUq9yUaR2H4-unsplash.jpg',
        address: 'Uttarakhand',
        location: {
            lat: 30.702999,
            lng: 77.863998
        },
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Delhi',
        description: 'Delhi,officially the National Capital Territory (NCT) of Delhi, is a megacity and a union territory of India containing New Delhi, the capital of India. Straddling the Yamuna river, but spread chiefly to the west, or beyond its right bank, Delhi shares borders with the state of Uttar Pradesh in the east and with the state of Haryana in the remaining directions.',
        imageUrl: 'https://www.tripsavvy.com/thmb/pAlZ4kx0tM9HFLmgkYbqMlfxaok=/2116x1417/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-846359134-5b515328c9e77c003738e40c.jpg',
        address: 'Capital',
        location: {
            lat: 28.643391,
            lng: 77.115479
        },
        creator: 'u2'
    }
]

const UserPlaces = () => {
    const userId = useParams().userId;
    const loadedPlaces = DUMMY_PLACES.filter(place => place.creator === userId)
    return <PlaceList items={loadedPlaces}/>
}

export default UserPlaces