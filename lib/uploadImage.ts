import {storage, ID} from "@/appwrite";

const uploadImage = async (file: File) => {
    if (!file) return;

    const fileUploaded = await storage.createFile(
        "648ecceb1ef1b5851c93",
        ID.unique(),
        file
    )

    return fileUploaded;
}

export default uploadImage;