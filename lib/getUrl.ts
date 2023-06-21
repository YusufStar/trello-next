import {storage} from "@/appwrite";

const getUrl = async (image: Image) => {
    const res = storage.getFilePreview(image.bucketId, image.fileId);

    return res.toString()
}

export default getUrl;