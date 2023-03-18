
export class PhotoService {

    public async getPhotoListFromFolder(folder: string): Promise<any> {
        const response = await fetch('http://localhost:3080/api/photo/?folder=' + folder);
        return await response.json();
    }
}