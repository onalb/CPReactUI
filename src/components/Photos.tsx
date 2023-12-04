import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

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
    let photosArray: Photo[] = []
    useEffect(() => {
        async function fetchData() {
            let _photos = await axios.get(
                "http://localhost:3080/api/photoList?folder=" + folder
            ).then((res)=>{
                let photoGrid = ''
                res.data.map((photo: { name: any; }, i: any) => {
                    console.log("Entered"); 
                    photoGrid += `<img src="http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}" height="300" alt=""></img>`
                 })
    
                setPhotos(photoGrid);
            })
            .catch((e)=>{
                console.log(e)
            });


        }

        if (folder) {
            try {
                fetchData()
            } catch(e) {
                console.log(e)
            }
        }
    }, [folder])
    
    return(
        <>
        <div dangerouslySetInnerHTML={{ __html: photos }} />
        </>
    )
}