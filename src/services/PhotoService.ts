import axios from "axios";

export const getPhotoListFromFolder = async (folder: string) => {
    const response = await axios.get(`http://localhost:3080/api/photoList?folder=${folder}`);
    return response.data;
};

export const getPhotoFromFolder = async(folder: string, photoName: string): Promise<any> => {
    const response = await fetch('http://localhost:3080/api/photo?folder=' + folder + '&image=' + photoName);
    console.log(response)
    var data = await response.json();
    return data;
}

export const deletePhotoListFromFolder = async (fullImageDirectory: string, fileName: string, imageDirectory: string) => {
    const response = await axios.post('http://localhost:3080/api/deleteImage', { fullImageDirectory : fullImageDirectory, fileName: fileName, imageDirectory: imageDirectory });
    return response.data;
};

export const toggleKeepPhoto = async (imagePath: string, imageName: string) => {
    const response = await axios.post('http://localhost:3080/api/toggleKeepImage', { imagePath : imagePath, imageName: imageName });
    return response.data;
};

export const openFolder = async (filePath: string) => {
    debugger;
    const response = await axios.post('http://localhost:3080/api/openFolder', { filePath : filePath });
    return response.data;
};