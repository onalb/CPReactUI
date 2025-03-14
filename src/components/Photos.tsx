import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from "react-lazy-load-image-component";

interface IPhotos {
    folder: string;
}

interface Photo {
    name: string;
    encodedPhoto: string;
    directory: string;
    content: string;
}

export const Photos = ({ folder }: IPhotos) => {
    const [photos, setPhotos] = useState<string>('')
      
    useEffect(() => {
        async function fetchData() {
            await axios.get(
                "http://localhost:3080/api/photoList?folder=" + folder
            ).then((res)=>{
                let photoGrid = ''
                res.data.map((photo: { name: any; }, i: any) => {
                    photoGrid += `<img src="http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}" height="300" alt="" loading="eager" />`
                 })
    
                setPhotos(photoGrid);
            })
            .catch((e)=>{
                console.error(e)
            });
        }

        if (folder) {
            try {
                fetchData()
            } catch(e) {
                console.error(e)
            }
        }
    }, [folder])
    
    return(
        <>
            <div id="photos-container" dangerouslySetInnerHTML={{ __html: photos }}/>

        </>
    )
}