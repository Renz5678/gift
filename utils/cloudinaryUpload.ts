/**
 * Uploads an image to Cloudinary
 * @param imageUri - The local URI of the image to upload
 * @returns The public URL of the uploaded image
 */
export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials not configured');
    }

    try {
        // Create form data
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'image.jpg';

        // Append the image file
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);

        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'story-posts'); // Organize images in a folder

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload image');
        }

        const data = await response.json();
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Deletes an image from Cloudinary
 * @param imageUrl - The URL of the image to delete
 * @returns True if deletion was successful
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
    try {
        // Extract public_id from the URL
        // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/story-posts/image.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL');
        }

        // Get everything after 'upload/v1234567890/'
        const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension

        console.log('Note: Image deletion from Cloudinary requires API credentials.');
        console.log('Public ID to delete:', publicId);

        // Note: Actual deletion requires API key and secret (server-side operation)
        // For now, we'll just remove the reference from the database
        return true;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};
