import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
interface IPhotos {
    folder: string;
    // photos: any[];
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
            );
                let photoGrid = ''
                _photos.data.map((photo: { name: any; }, i: any) => {     
                console.log("Entered"); 
                photoGrid += `<img src="http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}" height="300" alt=""></img>`
             })

            setPhotos(photoGrid);
        }

        if (folder) {
            fetchData()
        }
    }, [folder])
    
    return(
        <>
        <div dangerouslySetInnerHTML={{ __html: photos }} />
        {/* <Button onClick={() => changeImage('20211202_203921.jpg')}>Image</Button> */}
        {/* {photos.map((photo, i) => {     
           console.log("Entered");                 
            <img 
                src={"http://localhost:3080/api/photos?folder=" + folder + "&image=" + photo.name}
                height={"300"}
                alt="">
            </img>
        })} */}
        {/* {photos} */}
        {/* <img 
            src={"http://localhost:3080/api/photos?folder=C:\\Users\\burak\\Pictures\\sell\\90d\\&image=20211202_203921.jpg"}
            height={"300"}
            alt="">
        </img> */}

        {/* <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        height={"300"}
        alt="">
        </img> */}
        
        {/* <div>{photoTable}
        </div> */}
        </>

    )
}