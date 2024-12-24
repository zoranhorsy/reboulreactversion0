export async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload des images');
    }

    const data = await response.json();
    if (!data.success || !data.urls || data.urls.length === 0) {
        throw new Error('Erreur inattendue lors de l\'upload des images');
    }

    return data.urls;
}

