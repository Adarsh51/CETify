import * as htmlToImage from 'html-to-image';

export async function generateCookedCertificate(elementId: string, filename: string = 'officially-cooked-cetify.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // High resolution for Instagram
      backgroundColor: '#09090b',
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to generate meme certificate:', error);
  }
}
