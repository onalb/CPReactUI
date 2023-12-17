
export class PhotoService {

    public async getPhotoListFromFolder(folder: string): Promise<any> {
        const response = await fetch('http://localhost:3080/api/photo?folder=' + folder);
        console.log(response)
        return await response.json();
    }

    public async getPhotoFromFolder(folder: string, photoName: string): Promise<any> {
        const response = await fetch('http://localhost:3080/api/photo?folder=' + folder + '&image=' + photoName);
        console.log(response)
        var data = await response.json();
        return data;
    }
}