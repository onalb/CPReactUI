import React from 'react'

interface IPhotos {
    photos: any[];
}

export const Photos = ({photos}: IPhotos) => {
    
    // function toBase64(arr: any[]) {
    //     //arr = new Uint8Array(arr) if it's an ArrayBuffer
    //     return btoa(
    //        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    //     );
    //  }
    // console.log('photos length:::', photos)
    // if (photos.length === 0) return null

    // const PhotoRow = (photo: any, index: number) => {
        
    //     return(<img style={{height: "300px"}} src={`data:image/jpg;base64,` + toBase64(photo.data)} alt=""></img>)
    // }
    // var photoTable;
    // if(photos)
    // {
    //     photoTable = photos.map((photo, index) => PhotoRow(photo, index))
    // }


    return(
        <>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        <img 
        // style={"display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"} 
        src={"http://localhost:3080/api/photo?folder=C:\\Users\\burak\\Pictures\\topaz\\raw\\&image=20211219_225109(0).jpg"} 
        width={"1203"} 
        height={"802"}
        alt="">
        </img>
        
        {/* <div>{photoTable}
        </div> */}
        </>

    )
}