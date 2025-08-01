import axios from "axios";

export const getPhotoListFromFolder = async (folder: string) => {
    const response = await axios.get(`https://localhost:3080/api/photoList?folder=${folder}`);
    return response.data;
};

export const getPhotoFromFolder = async(folder: string, photoName: string): Promise<any> => {
    const response = await fetch('https://localhost:3080/api/photo?folder=' + folder + '&image=' + photoName);
    console.log(response)
    var data = await response.json();
    return data;
}

export const deletePhotoListFromFolder = async (fullImageDirectory: string, fileName: string, imageDirectory: string) => {
    const response = await axios.post('https://localhost:3080/api/deleteImage', { fullImageDirectory : fullImageDirectory, fileName: fileName, imageDirectory: imageDirectory });
    return response.data;
};

export const toggleKeepPhoto = async (imagePath: string, imageName: string) => {
    const response = await axios.post('https://localhost:3080/api/toggleKeepImage', { imagePath : imagePath, imageName: imageName });
    return response.data;
};

export const toggleMarkForDeletion = async (imagePath: string, imageName: string) => {
    const response = await axios.post('https://localhost:3080/api/toggleMarkForDeletionImage', { imagePath : imagePath, imageName: imageName });
    return response.data;
};

export const openFolder = async (filePath: string) => {
    const response = await axios.post('https://localhost:3080/api/openFolder', { filePath : filePath });
    return response.data;
};

export const openFolderInNewTab = async (isOpenedOnBrowser: boolean) => {
    const response = await axios.get(`https://localhost:3080/api/openFolderInNewTab?isOpenedOnBrowser=${isOpenedOnBrowser}`);
    return response.data;
};

export const openDirectoryDialog = async () => {
    const response = await axios.post('https://localhost:3080/api/open-directory-dialog');
    return response.data;
};