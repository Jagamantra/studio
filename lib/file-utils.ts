export const generateUniqueFileName = (originalName: string): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `upload_${timestamp}_${randomString}.${extension}`;
};

type saveResponse = {
    filePath: string;
    publicId: string;
};

export const saveBase64File = async (base64Data: string, fileName: string): Promise<saveResponse> => {
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base64Data,
                fileName,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save file');
        }

        const data = await response.json();
        const responseback = {
            faviconPath: data.url,
            faviconPublicId: data.public_id,
        }
        return responseback;
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
    }
};

export const deleteUploadedFile = async (filePath: string) => {
    if (!filePath || !filePath.startsWith('/uploads/')) return;

    try {
        const response = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filePath,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
};
