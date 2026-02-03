import React, {useRef, useEffect} from "react";
import './Map.css'

const Map = props => {
    const mapRef = useRef()

    const { center, zoom } = props

    // registers logic that should be executed when certain input changes
    useEffect(() => {
        const map = new window.google.map.Maps(mapRef.current, {
        center: center,
        zoom: zoom
    })
     new window.google.maps.Marker({position: center, map: map})
    }, [center, zoom])       

    // useRef can be used to create references to get a reference at a real DOM node
    return <div ref={mapRef} className={`map ${props.className}`} style={props.style}></div>
}

export default Map