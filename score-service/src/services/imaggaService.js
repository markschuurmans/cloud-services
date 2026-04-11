import axios from 'axios';
import FormData from 'form-data';

export const getImaggaTags = async (imageUrl) => {
    const apiKey = process.env.IMAGGA_API_KEY;
    const apiSecret = process.env.IMAGGA_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Imagga API credentials are not configured properly.');
    }

    const imageResponse = await axios.get(targetServiceUrl + imageUrl, { responseType: 'stream' });

    const form = new FormData();

    const fileName = imageUrl.split('/').pop() || 'upload.jpg';
    form.append('image', imageResponse.data, { filename: fileName });

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const imaggaResponse = await axios.post('https://api.imagga.com/v2/tags', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Basic ${credentials}`
      }
    });

    return imaggaResponse.data.result.tags;
};

export const calculateImaggaMatch = (targetTags, submissionTags) => {
  if (!targetTags || !submissionTags || targetTags.length === 0) return 0;

  let totalTargetConfidence = 0;
  let overlappingConfidence = 0;

  // Expected structure: { tag: { en: "tree" }, confidence: 99.5 }
  const submissionTagsMap = new Map();
  submissionTags.forEach(t => {
    submissionTagsMap.set(t.tag.en, t.confidence);
  });

  targetTags.forEach(targetTag => {
    const tagName = targetTag.tag.en;
    const targetConf = targetTag.confidence;
    
    totalTargetConfidence += targetConf;

    if (submissionTagsMap.has(tagName)) {
      const submissionConf = submissionTagsMap.get(tagName);
      overlappingConfidence += Math.min(targetConf, submissionConf);
    }
  });

  if (totalTargetConfidence === 0) return 0;

  return (overlappingConfidence / totalTargetConfidence) * 100;
};
